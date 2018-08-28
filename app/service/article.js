/**
 * @desc Article Services
 */

const ProxyService = require('./proxy2')

module.exports = class ArticleService extends ProxyService {
    get model () {
        return this.app.model.Article
    }

    get rules () {
        return {
            list: {
                page: { type: 'number', required: true, min: 1 },
                limit: { type: 'number', required: true, min: 1 },
                state: { type: 'enum', values: Object.values(this.config.modelValidate.article.state.optional), required: false },
                category: { type: 'objectId', required: false },
                tag: { type: 'objectId', required: false },
                keyword: { type: 'string', required: false },
                startDate: { type: 'dateTime', required: false },
                endDate: { type: 'dateTime', required: false },
                // -1 desc | 1 asc
                order: { type: 'enum', values: [-1, 1], required: false },
                sortBy: { type: 'enum', values: ['createdAt', 'updatedAt', 'publishedAt', 'meta.ups', 'meta.pvs', 'meta.comments'], required: false }
            },
            item: {
                // 后台用，只获取当前文章内容，不获取相关文章和上下篇文章
                single: { type: 'boolean', required: false }
            },
            create: {
                title: { type: 'string', required: true },
                content: { type: 'string', required: true },
                description: { type: 'string', required: false },
                keywords: { type: 'array', required: false },
                category: { type: 'objectId', required: false },
                tag: { type: 'array', required: false, itemType: 'objectId' },
                state: { type: 'enum', values: Object.values(this.config.modelValidate.article.state.optional), required: false },
                thumb: { type: 'url', required: false },
                createdAt: { type: 'dateTime', required: false }
            },
            update: {
                title: { type: 'string', required: false },
                content: { type: 'string', required: false },
                description: { type: 'string', required: false },
                keywords: { type: 'array', required: false },
                category: { type: 'objectId', required: false },
                tag: { type: 'array', required: false, itemType: 'objectId' },
                state: { type: 'enum', values: Object.values(this.config.modelValidate.article.state.optional), required: false },
                thumb: { type: 'url', required: false },
                createdAt: { type: 'dateTime', required: false }
            }
        }
    }

    async getLimitListByQuery (query, opt) {
        opt = Object.assign({ lean: true }, opt)
        const data = await this.model.paginate(query, opt)
        return this.app.getDocsPaginationData(data)
    }

    async getItemById (id, select, opt = {}, single = false) {
        let api = this.getItem.bind(this)
        const query = { _id: id }
        if (!this.ctx._isAuthed) {
            api = this.updateItem.bind(this)
            // 前台博客访问文章的时候pv+1
            query.state = this.config.modelValidate.article.state.optional.PUBLISH
            select += ' -content'
            opt.$inc = { 'meta.pvs': 1 }
        }
        const data = await api(query, select, opt)
        if (data && !single) {
            // 获取相关文章和上下篇文章
            const [related, adjacent] = await Promise.all([
                this.getRelatedArticles(data),
                this.getAdjacentArticles(data)
            ])
            data.related = related
            data.adjacent = adjacent
        }
        return data
    }

    async like () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        return await this.updateItemById(params.id, {
            $inc: {
                'meta.ups': 1
            }
        })
    }

    async archives () {
        const $match = {}
        const $project = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            title: 1,
            createdAt: 1
        }
        if (!this.ctx._isAuthed) {
            $match.state = 1
        } else {
            $project.state = 1
        }
        let data = await this.aggregate([
            { $match },
            { $sort: { createdAt: 1 } },
            { $project },
            {
                $group: {
                    _id: {
                        year: '$year',
                        month: '$month'
                    },
                    articles: {
                        $push: {
                            title: '$title',
                            _id: '$_id',
                            createdAt: '$createdAt',
                            state: '$state'
                        }
                    }
                }
            }
        ])
        let count = 0
        if (data && data.length) {
            data = [...new Set(data.map(item => item._id.year))].map(year => {
                const months = []
                data.forEach(item => {
                    const { _id, articles } = item
                    if (year === _id.year) {
                        count += articles.length
                        months.push({
                            month: _id.month,
                            monthStr: this.app.utils.share.getMonthFromNum(_id.month),
                            articles
                        })
                    }
                })
                return {
                    year,
                    months
                }
            })
        }
        return {
            count,
            list: data || []
        }
    }

    // 根据标签获取相关文章
    async getRelatedArticles (data) {
        if (!data || !data._id) return null
        const { _id, tag = [] } = data
        const articles = await this.getList(
            {
                _id: { $nin: [ _id ] },
                state: data.state,
                tag: { $in: tag.map(t => t._id) }
            },
            'title thumb createdAt publishedAt meta category',
            null,
            {
                path: 'category',
                select: 'name description'
            }
        ).catch(err => {
            this.logger.error('相关文章查询失败，错误：' + err.message)
            return null
        })
        return articles && articles.slice(0, this.app.setting.limit.relatedArticleCount) || null
    }

    // 获取相邻的文章
    async getAdjacentArticles (data) {
        if (!data || !data._id) return null
        const query = {
            createdAt: {
                $lt: data.createdAt
            }
        }
        // 如果未通过权限校验，将文章状态重置为1
        if (!this.ctx._isAuthed) {
            query.state = this.config.modelValidate.article.state.optional.PUBLISH
        }
        const prev = await this.getItem(
            query,
            'title createdAt publishedAt thumb category',
            {
                sort: 'createdAt'
            },
            {
                path: 'category',
                select: 'name description'
            }
        ).catch(err => {
            this.logger.error('前一篇文章获取失败，错误：' + err.message)
            return null
        })
        query.createdAt = {
            $gt: data.createdAt
        }
        const next = await this.getItem(
            query,
            'title createdAt publishedAt thumb category',
            {
                sort: 'createdAt'
            },
            {
                path: 'category',
                select: 'name description'
            }
        ).catch(err => {
            this.logger.error('后一篇文章获取失败，错误：' + err.message)
            return null
        })
        return {
            prev: prev || null,
            next: next || null
        }
    }


    async updateCommentCount (articleIds = []) {
        if (!Array.isArray(articleIds)) {
            articleIds = [articleIds]
        }
        if (!articleIds.length) return
        const { validate, share } = this.app.utils
        // TIP: 这里必须$in的是一个ObjectId对象数组，而不能只是id字符串数组
        articleIds = [...new Set(articleIds)].filter(id => validate.isObjectId(id)).map(id => share.createObjectId(id))
        const counts = await this.service.comment.aggregate([
            { $match: { state: 1, article: { $in: articleIds } } },
            { $group: { _id: '$article', total_count: { $sum: 1 } } }
        ]).catch(err => {
            this.logger.error('更新文章评论数量前聚合评论数据操作失败，错误：' + err.message)
            return []
        })
        Promise.all(
            counts.map(count => this.updateItemById(count._id, { $set: { 'meta.comments': count.total_count } }))
        )
            .then(() => this.logger.info('文章评论数量更新成功'))
            .catch(err => this.logger.error('文章评论数量更新失败，错误：' + err.message))
    }
}
