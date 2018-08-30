/**
 * @desc 评论 Controller
 */

const { Controller } = require('egg')

module.exports = class CommentController extends Controller {
    get rules () {
        return {
            list: {
                page: { type: 'int', required: true, min: 1 },
                limit: { type: 'int', required: false, min: 1 },
                state: { type: 'enum', values: Object.values(this.config.modelValidate.comment.state.optional), required: false },
                type: { type: 'enum', values: Object.values(this.config.modelValidate.comment.type.optional), required: false },
                author: { type: 'objectId', required: false },
                article: { type: 'objectId', required: false },
                parent: { type: 'objectId', required: false },
                keyword: { type: 'string', required: false },
                // 时间区间查询仅后台可用，且依赖于createdAt
                startDate: { type: 'dateTime', required: false },
                endDate: { type: 'dateTime', required: false },
                // 排序仅后台能用，且order和sortBy需同时传入才起作用
                // -1 desc | 1 asc
                order: { type: 'enum', values: [-1, 1], required: false },
                sortBy: { type: 'enum', values: ['createdAt', 'updatedAt', 'ups'], required: false }
            },
            create: {
                content: { type: 'string', required: true },
                type: { type: 'enum', values: Object.values(this.config.modelValidate.comment.type.optional), required: true },
                article: { type: 'objectId', required: false },
                parent: { type: 'objectId', required: false },
                forward: { type: 'objectId', required: false }
            },
            update: {
                content: { type: 'string', required: false },
                state: { type: 'enum', values: Object.values(this.config.modelValidate.comment.state.optional), required: false },
                sticky: { type: 'boolean', required: false }
            }
        }
    }

    async list () {
        const { ctx } = this
        ctx.query.page = Number(ctx.query.page)
        if (ctx.query.limit) {
            ctx.query.limit = Number(ctx.query.limit)
        }
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, state, type, keyword, author, article, parent, order, sortBy, startDate, endDate } = ctx.query
        // 过滤条件
        const options = {
            sort: {
                createdAt: 1
            },
            page,
            limit: limit || this.app.setting.limit.commentCount,
            select: '',
            populate: [
                {
                    path: 'author',
                    select: !ctx.session._isAuthed ? 'github avatar name site' : '-password'
                },
                {
                    path: 'parent',
                    select: 'author meta sticky ups',
                    match: !ctx.session._isAuthed && {
                        state: 1
                    } || null
                },
                {
                    path: 'forward',
                    select: 'author meta sticky ups',
                    match: !ctx.session._isAuthed && {
                        state: 1
                    } || null,
                    populate: {
                        path: 'author',
                        select: 'avatar github name'
                    }
                }
            ]
        }

        // 查询条件
        const query = { state, type, author, article }

        // 搜索关键词
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { title: keywordReg }
            ]
        }

        if (parent) {
            // 获取子评论
            query.parent = parent
        } else {
            // 获取父评论
            query.parent = { $exists: false }
        }

        // 未通过权限校验（前台获取文章列表）
        if (!ctx.session._isAuthed) {
            // 将评论状态重置为1
            query.state = 1
            query.spam = false
            // 评论列表不需要content和state
            options.select = '-content -state -updatedAt -spam -type'
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
        const data = await this.service.comment.getLimitListByQuery(ctx.processPayload(query), options)
        data
            ? ctx.success(data, '评论列表获取成功')
            : ctx.fail('评论列表获取失败')
    }

    async item () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.comment.getItemById(params.id)
        data
            ? ctx.success(data, '评论详情获取成功')
            : ctx.fail('评论详情获取失败')
    }

    async create () {
        const { ctx } = this
        ctx.validateCommentAuthor()
        const body = ctx.validateBody(this.rules.create)
        const { COMMENT, MESSAGE } = this.config.modelValidate.comment.type.optional
        body.author = ctx.request.body.author
        const { article, parent, forward, type, content, author } = body
        if (type === COMMENT) {
            if (!article) {
                return ctx.fail(422, '缺少文章ID')
            }
        } else if (type === MESSAGE) {
            // 站内留言
            delete body.article
        }
        if ((parent && !forward) || (!parent && forward)) {
            return ctx.fail(422, '缺少父评论ID或被回复评论ID')
        }
        const user = await this.service.user.checkCommentAuthor(author)
        if (!user) {
            return ctx.fail('用户不存在')
        } else if (user.mute) {
            // 被禁言
            return ctx.fail('该用户已被禁言')
        }
        body.author = user._id
        const spamValid = await this.service.user.checkUserSpam(user)
        if (!spamValid) {
            return ctx.fail('该用户的垃圾评论数量已达到最大限制，已被禁言')
        }
        const { ip, location } = ctx.getLocation()
        const meta = body.meta = {
            location,
            ip,
            ua: ctx.req.headers['user-agent'] || '',
            referer: ctx.req.headers.referer || ''
        }
        // 永链
        const permalink = this.service.comment.getPermalink(body)
        const isSpam = await this.app.akismet.checkSpam({
            user_ip: ip,
            user_agent: meta.ua,
            referrer: meta.referer,
            permalink,
            comment_type: this.service.comment.getCommentType(type),
            comment_author: user.name,
            comment_author_email: user.email,
            comment_author_url: user.site,
            comment_content: content,
            is_test: this.config.isProd
        })
        // 如果是Spam评论
        if (isSpam) {
            return ctx.fail('检测为垃圾评论，该评论将不会显示')
        }
        this.logger.info('评论检测正常，可以发布')
        body.renderedContent = this.app.utils.markdown.render(body.content)
        const comment = await this.service.comment.create(body)
        if (comment) {
            const data = await this.service.comment.getItemById(comment._id)
            if (data.type === COMMENT) {
                // 如果是文章评论，则更新文章评论数量
                this.service.article.updateCommentCount(data.article)
            }
            // 发送邮件通知站主和被评论者
            this.service.comment.sendCommentEmailToAdminAndUser(data)
            ctx.success(data, data.type === COMMENT ? '评论发布成功' : '留言发布成功')
        } else {
            ctx.fail('发布失败')
        }
    }

    async update () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        if (!ctx.session._isAuthed) {
            ctx.validateCommentAuthor()
        }
        const body = ctx.validateBody(this.rules.update)
        body.author = ctx.request.body.author
        const exist = await this.service.comment.getItemById(params.id)
        if (!exist) {
            return ctx.fail('评论不存在')
        }
        if (!ctx.session._isAuthed && ctx.session._user._id !== exist.author._id) {
            return ctx.fail('非本人评论不能修改')
        }
        // 状态修改是涉及到spam修改
        if (body.state !== undefined) {
            const permalink = this.service.comment.getPermalink(exist)
            const opt = {
                user_ip: exist.meta.ip,
                user_agent: exist.meta.ua,
                referrer: exist.meta.referer,
                permalink,
                comment_type: this.service.comment.getCommentType(exist.type),
                comment_author: exist.author.github.login,
                comment_author_email: exist.author.github.email,
                comment_author_url: exist.author.github.blog,
                comment_content: exist.content,
                is_test: this.config.isProd
            }
            const SPAM = this.config.modelValidate.comment.state.optional.SPAM
            if (exist.state === SPAM && body.state !== SPAM) {
                // 垃圾评论转为正常评论
                if (exist.spam) {
                    body.spam = false
                    // 异步报告给Akismet
                    this.app.akismet.submitSpam(opt)
                }
            } else if (exist.state !== SPAM && body.state === SPAM) {
                // 正常评论转为垃圾评论
                if (!exist.spam) {
                    body.spam = true
                    // 异步报告给Akismet
                    this.app.akismet.submitHam(opt)
                }
            }
        }
        if (body.content) {
        body.renderedContent = this.app.utils.markdown.render(body.content)
        }
        let data = null
        if (!ctx.session._isAuthed) {
            data = await this.service.comment.updateItemById(
                params.id,
                body,
                null,
                [
                    {
                        path: 'author',
                        select: 'github'
                    }, {
                        path: 'parent',
                        select: 'author meta sticky ups'
                    }, {
                        path: 'forward',
                        select: 'author meta sticky ups'
                    }
                ]
            )
        } else {
            data = await this.service.comment.updateItemById(params.id, body)
        }
        data
            ? ctx.success(data, '评论更新成功')
            : ctx.fail('评论更新失败')
    }

    async delete () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.comment.deleteItemById(params.id)
        if (data.type === this.config.modelValidate.comment.type.optional.COMMENT) {
            // 异步 如果是文章评论，则更新文章评论数量
            this.service.article.updateCommentCount(data.article)
        }
        data
            ? ctx.success('评论删除成功')
            : ctx.fail('评论删除失败')
    }

    async like () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.comment.updateItemById(params.id, {
            $inc: {
                ups: 1
            }
        })
        data
            ? ctx.success('评论点赞成功')
            : ctx.fail('评论点赞失败')
    }
}
