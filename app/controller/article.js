/**
 * @desc 文章 Controller
 */

const { Controller } = require('egg')

module.exports = class ArticleController extends Controller {
    get rules () {
        return {
            list: {
                page: { type: 'int', required: true, min: 1 },
                limit: { type: 'int', required: false, min: 1 },
                state: { type: 'enum', values: Object.values(this.config.modelEnum.article.state.optional), required: false },
                source: { type: 'enum', values: Object.values(this.config.modelEnum.article.source.optional), required: false },
                category: { type: 'objectId', required: false },
                tag: { type: 'objectId', required: false },
                keyword: { type: 'string', required: false },
                startDate: { type: 'dateTime', required: false },
                endDate: { type: 'dateTime', required: false },
                // -1 desc | 1 asc
                order: { type: 'enum', values: [-1, 1], required: false },
                sortBy: { type: 'enum', values: ['createdAt', 'updatedAt', 'publishedAt', 'meta.ups', 'meta.pvs', 'meta.comments'], required: false }
            },
            create: {
                title: { type: 'string', required: true },
                content: { type: 'string', required: true },
                description: { type: 'string', required: false },
                keywords: { type: 'array', required: false },
                category: { type: 'objectId', required: true },
                tag: { type: 'array', required: false, itemType: 'objectId' },
                state: { type: 'enum', values: Object.values(this.config.modelEnum.article.state.optional), required: true },
                source: { type: 'enum', values: Object.values(this.config.modelEnum.article.source.optional), required: true },
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
                state: { type: 'enum', values: Object.values(this.config.modelEnum.article.state.optional), required: false },
                source: { type: 'enum', values: Object.values(this.config.modelEnum.article.source.optional), required: false },
                thumb: { type: 'url', required: false },
                createdAt: { type: 'dateTime', required: false }
            }
        }
    }

    async list () {
        const { ctx } = this
        ctx.query.page = Number(ctx.query.page)
        const tranArray = ['limit', 'state', 'source', 'order']
        tranArray.forEach(key => {
            if (ctx.query[key]) {
                ctx.query[key] = Number(ctx.query[key])
            }
        })
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, state, keyword, category, tag, source, order, sortBy, startDate, endDate } = ctx.query
        const options = {
            sort: {
                updatedAt: -1,
                createdAt: -1
            },
            page,
            limit: limit || this.app.setting.limit.articleCount,
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
        const query = { state, category, tag, source }

        // 搜索关键词
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { title: keywordReg }
            ]
        }

        // 未通过权限校验（前台获取文章列表）
        if (!ctx.session._isAuthed) {
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
        const data = await this.service.article.getLimitListByQuery(ctx.processPayload(query), options)
        const statService = this.service.stat
        // 生成搜索统计
        if (query.category) {
            statService.record('CATEGORY_SEARCH', { category: query.category }, 'count')
        }
        if (query.tag) {
            statService.record('TAG_SEARCH', { tag: query.tag }, 'count')
        }
        if (keyword) {
            statService.record('KEYWORD_SEARCH', { keyword }, 'count')
        }
        data
            ? ctx.success(data, '文章列表获取成功')
            : ctx.fail('文章列表获取失败')
    }

    async item () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.article.getItemById(params.id)
        if (!this.ctx.session._isAuthed) {
            // 生成 pv 统计项
            this.service.stat.record('ARTICLE_VIEW', { article: params.id }, 'count')
        }
        data
            ? ctx.success(data, '文章详情获取成功')
            : ctx.fail('文章详情获取失败')
    }

    async create () {
        const { ctx } = this
        const body = ctx.validateBody(this.rules.create)
        if (body.createdAt) {
            body.createdAt = new Date(body.createdAt)
        }
        const exist = await this.service.article.getItem({ title: body.title })
        if (exist) {
            return ctx.fail('文章名称重复')
        }
        const data = await this.service.article.create(body)
        data
            ? ctx.success(data, '文章创建成功')
            : ctx.fail('文章创建失败')
    }

    async update () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const body = ctx.validateBody(this.rules.update)
        if (body.createdAt) {
            body.createdAt = new Date(body.createdAt)
        }
        const exist = await this.service.article.getItem({
            _id: {
                $ne: params.id
            },
            title: body.title
        })
        if (exist) {
            return ctx.fail('文章名称重复')
        }
        const data = await this.service.article.updateItemById(
            params.id,
            body,
            null,
            'category tag'
        )
        data
            ? ctx.success(data, '文章更新成功')
            : ctx.fail('文章更新失败')
    }

    async delete () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.article.deleteItemById(params.id)
        data
            ? ctx.success('文章删除成功')
            : ctx.fail('文章删除失败')
    }

    async like () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.article.updateItemById(params.id, {
            $inc: {
                'meta.ups': 1
            }
        })
        if (data) {
            if (!this.ctx.session._isAuthed) {
                // 生成like通告
                this.service.notification.recordLike('article', data, ctx.request.body.user, true)
                // 生成 like 统计项
                this.service.stat.record('ARTICLE_LIKE', { article: params.id }, 'count')
            }
            ctx.success('文章点赞成功')
        } else {
            ctx.fail('文章点赞失败')
        }
    }

    async unlike () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.article.updateItemById(params.id, {
            $inc: {
                'meta.ups': -1
            }
        })
        if (data) {
            // 生成unlike通告
            this.service.notification.recordLike('article', data, ctx.request.body.user, false)
            ctx.success('文章取消点赞成功')
        } else {
            ctx.fail('文章取消点赞失败')
        }
    }


    async archives () {
        this.ctx.success(await this.service.article.archives(), '归档获取成功')
    }
}
