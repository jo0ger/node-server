/**
 * @desc Article Services
 */

const ProxyService = require('./proxy')

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

    async list () {
        const { ctx } = this
        ctx.query.page = Number(ctx.query.page)
        ctx.query.limit = Number(ctx.query.limit)
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, state, keyword, category, tag, order, sortBy, startDate, endDate } = ctx.query
        const options = {
            sort: {
                updatedAt: -1,
                createdAt: -1
            },
            page,
            limit,
            lean: true,
            select: '-content -renderedContent',
            populate: [
                {
                    path: 'category',
                    select: 'name description extends'
                }, {
                    path: 'tag',
                    select: 'name description'
                }
            ]
        }
        const query = {}
        if (state !== undefined) {
            query.state = state
        }

        // 搜索关键词
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { title: keywordReg }
            ]
        }

        // 分类
        if (category) {
            // 如果是id
            if (this.app.utils.validate.isObjectId(category)) {
                query.category = category
            } else {
                // 普通字符串，需要先查到id
                const c = await this.service.category.findOne({ name: category }).exec()
                query.category = c ? c._id : this.app.utils.share.createObjectId()
            }
        }

        // 标签
        if (tag) {
            // 如果是id
            if (this.app.utils.validate.isObjectId(tag)) {
                query.tag = tag
            } else {
                // 普通字符串，需要先查到id
                const t = await this.service.tag.findOne({ name: tag }).exec()
                query.tag = t ? t._id : this.app.utils.share.createObjectId()
            }
        }

        // 未通过权限校验（前台获取文章列表）
        if (!ctx._isAuthenticated) {
            // 将文章状态重置为1
            query.state = 1
            // 文章列表不需要content和state
            options.select = '-content -renderedContent -state'
        } else {
            // 排序
            if (sortBy && order) {
                options.sort = {}
                options.sort[sortBy] = order
            }

            // 起始日期
            if (startDate) {
                const $gte = new Date(startDate)
                if ($gte.toString() !== 'Invalid Date') {
                    query.createdAt = { $gte }
                }
            }

            // 结束日期
            if (endDate) {
                const $lte = new Date(endDate)
                if ($lte.toString() !== 'Invalid Date') {
                    query.createdAt = Object.assign({}, query.createdAt, { $lte })
                }
            }
        }

        const data = await this.service.article.paginate(query, options)
        return this.app.utils.share.getDocsPaginationData(data)
    }

    async item () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        ctx.validate(this.rules.item, ctx.query)
        let query = null
        // 只有前台博客访问文章的时候pv才+1
        if (!ctx._isAuthenticated) {
            query = this.updateOne({ _id: params.id, state: this.config.modelValidate.article.state.optional.PUBLISH }, { $inc: { 'meta.pvs': 1 } }).select('-content')
        } else {
            query = this.findById(params.id)
        }
        const data = await query.populate([
            {
                path: 'category',
                select: 'name description extends'
            }, {
                path: 'tag',
                select: 'name description extends'
            }
        ]).exec()

        if (data && !ctx.query.single) {
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

    async create () {
        const body = this.ctx.validateBody(this.rules.create)
        if (body.createdAt) {
            body.createdAt = new Date(body.createdAt)
        }
        let data = await this.newAndSave(body)
        if (data && data.length) {
            data = data[0].toObject()
        }
        return data
    }

    async update () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        const body = ctx.validateBody(this.rules.update)
        if (body.createdAt) {
            body.createdAt = new Date(body.createdAt)
        }
        return await this.updateById(params.id, body).populate('category tag').exec()
    }

    async delete () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        const data = await this.deleteById(params.id).exec()
        return data && data.ok && data.n
    }

    async like () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        return await this.updateById(params.id, {
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
        if (!this.ctx._isAuthenticated) {
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
        const articles = await this.service.article.find({
            _id: { $nin: [ _id ] },
            state: 1,
            tag: { $in: tag.map(t => t._id) }
        })
            .select('title thumb createdAt publishedAt meta category')
            .populate({
                path: 'category',
                select: 'name description'
            })
            .exec()
            .catch(err => {
                this.logger.error('相关文章查询失败，错误：' + err.message)
                return null
            })
        return articles && articles.slice(0, 10) || null
    }

    // 获取相邻的文章
    async getAdjacentArticles (ctx, data) {
        if (!data || !data._id) return null
        const query = {}
        // 如果未通过权限校验，将文章状态重置为1
        if (!ctx._isAuthenticated) {
            query.state = this.config.modelValidate.article.state.optional.PUBLISH
        }
        const prev = await this.service.article.findOne(query)
            .select('title createdAt publishedAt thumb category')
            .populate({
                path: 'category',
                select: 'name description'
            })
            .sort('-createdAt')
            .lt('createdAt', data.createdAt)
            .exec()
            .catch(err => {
                this.logger.error('前一篇文章获取失败，错误：' + err.message)
                return null
            })
        const next = await this.service.article.findOne(query)
            .select('title createdAt publishedAt thumb category')
            .populate({
                path: 'category',
                select: 'name description'
            })
            .sort('createdAt')
            .gt('createdAt', data.createdAt)
            .exec()
            .catch(err => {
                this.logger.error('后一篇文章获取失败，错误：' + err.message)
                return null
            })
        return {
            prev: prev ? prev.toObject() : null,
            next: next ? next.toObject() : null
        }
    }
}
