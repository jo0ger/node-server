/**
 * @desc Comment Services
 */

const ProxyService = require('./proxy')

module.exports = class CommentService extends ProxyService {
    get model () {
        return this.app.model.Comment
    }

    get rules () {
        return {
            list: {
                page: { type: 'number', required: true, min: 1 },
                limit: { type: 'number', required: true, min: 1 },
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
                state: { type: 'enum', values: Object.values(this.config.modelValidate.comment.state.optional), required: false },
                sticky: { type: 'boolean', required: false },
                type: { type: 'enum', values: Object.values(this.config.modelValidate.comment.type.optional), required: false },
                article: { type: 'objectId', required: false },
                partner: { type: 'objectId', required: false },
                forward: { type: 'objectId', required: false },
                author: { type: 'object', required: true }
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
        ctx.query.limit = Number(ctx.query.limit)
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, state, type, keyword, author, article, parent, order, sortBy, startDate, endDate } = ctx.query
        // 过滤条件
        const options = {
            sort: { createdAt: 1 },
            page,
            limit,
            select: '',
            populate: [
                {
                    path: 'author',
                    select: !ctx._isAuthed ? 'github avatar name site' : ''
                },
                {
                    path: 'parent',
                    select: 'author meta sticky ups',
                    match: {
                        state: 1
                    }
                },
                {
                    path: 'forward',
                    select: 'author meta sticky ups',
                    match: {
                        state: 1
                    },
                    populate: {
                        path: 'author',
                        select: 'avatar github name'
                    }
                }
            ]
        }

        // 查询条件
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

        // 用户
        if (author) {
            // 如果是id
            if (this.app.utils.validate.isObjectId(author)) {
                query.author = author
            } else {
                // 普通字符串，需要先查到id
                const u = await this.service.user.findOne({ name: author }).exec()
                query.author = u ? u._id : this.app.utils.share.createObjectId()
            }
        }

        // 文章
        if (article) {
            // 如果是id
            if (this.app.utils.validate.isObjectId(article)) {
                query.article = article
            } else {
                // 普通字符串，需要先查到id
                const a = await this.service.article.findOne({ name: article }).exec()
                query.article = a ? a._id : this.app.utils.share.createObjectId()
            }
        }

        if (parent) {
            // 获取子评论
            query.parent = parent
        } else {
            // 获取父评论
            query.parent = { $exists: false }
        }

        // 未通过权限校验（前台获取文章列表）
        if (!ctx._isAuthed) {
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
        const comments = await this.service.comment.paginate(query, options)
        if (!comments) return null
        const data = []
        // 查询子评论数量
        await Promise.all(comments.docs.map(doc => {
            doc = doc.toObject()
            doc.subCount = 0
            data.push(doc)
            return this.service.comment.count({ parent: doc._id }).exec()
                .then(count => {
                    doc.subCount = count
                })
        }))
        comments.docs = data
        return this.app.utils.share.getDocsPaginationData(comments)
    }

    async item () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        let data = null
        let queryPs = null
        if (!ctx._isAuthed) {
            queryPs = this.findOne({ _id: params.id, state: 1, spam: false })
                .select('-content -state -updatedAt -type -spam')
                .populate({
                    path: 'author',
                    select: 'github'
                })
                .populate({
                    path: 'parent',
                    select: 'author meta sticky ups'
                })
                .populate({
                    path: 'forward',
                    select: 'author meta sticky ups'
                })
        } else {
            queryPs = this.findById(id)
        }

        data = await queryPs.populate([
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
        ]).exec()
        
        return data
    }

    async create () {
        const { ctx } = this
        const body = ctx.validateBody(this.rules.create)
        const { article, parent, forward, type, author, content } = body
        if (type === this.config.modelValidate.comment.type.optional.COMMENT) {
            if (!article) {
                return ctx.fail(422, '缺少文章ID')
            }
        }
        if ((parent && !forward) || (!parent && forward)) {
            return ctx.fail(422, '缺少parent和forward参数')
        }
        const user = await this.service.user.checkCommentAuthor(author)
        if (!user) {
            return ctx.fail('用户不存在')
        } else if (user.mute) {
            // 被禁言
            return ctx.fail('该用户已被禁言')
        }
        body.author = user._id
        if (!this.service.user.checkUserSpam(user)) {
            return ctx.fail('该用户的垃圾评论数量已达到最大限制，已被禁言')
        }
        const { ip, location } = ctx.getLocation()
        body.meta = {
            location,
            ip,
            ua: ctx.req.headers['user-agent'] || '',
            referer: ctx.req.headers['referer'] || ''
        }
        // 永链
        const permalink = this.getPermalink(body)
        const isSpam = await this.app.akismet.checkSpam({
			user_ip: ip,
			user_agent: body.meta.ua,
			referrer: body.meta.referer,
			permalink,
			comment_type: getCommentType(type),
			comment_author: user.name,
			comment_author_email: user.email,
			comment_author_url: user.site,
			comment_content: content,
			is_test: this.app.config.isProd
        })
        // 如果是Spam评论
        if (isSpam) {
            return ctx.fail('检测为垃圾评论，该评论将不会显示')
        }
        body.renderedContent = this.app.utils.markdown.render(content)
        let data = await this.newAndSave(body)
        if (data && data.length) {
            data = data[0]
            if (!ctx._isAuthed) {
                data = await this.findById(data._id)
                    .select('-content -state -updatedAt')
                    .populate({
                        path: 'author',
                        select: 'name site avatar role mute email'
                    })
                    .populate({
                        path: 'parent',
                        select: 'author meta sticky ups'
                    })
                    .populate({
                        path: 'forward',
                        select: 'author meta sticky ups'
                    })
            } else {
                data = await this.findById(data._id).exec()
            }
            ctx.success(data, '评论发布成功')
        } else {
            ctx.fail('评论发布失败')
        }
        return data
    }

    async update () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        const body = ctx.validateBody(this.rules.create)
        let cache = await this.findById(params.id).populate('author')
        if (!cache) {
            return ctx.fail('评论不存在')
        }
        cache = cache.toObject()
        if (ctx._isAuthed && ctx._user._id.toString() !== cache.author._id.toString()) {
            return ctx.fail('其他人的评论内容不能修改')
        }
    
        if (body.content !== undefined) {
            body.renderedContent = this.app.utils.markdown.render(body.content)
        }

        // 状态修改是涉及到spam修改
        if (body.state !== undefined) {
            const permalink = this.getPermalink(cache)
            const opt = {
                user_ip: cache.meta.ip,
                user_agent: cache.meta.ua,
                referrer: cache.meta.referer,
                permalink,
                comment_type: getCommentType(cache.type),
                comment_author: cache.author.github.login,
                comment_author_email: cache.author.github.email,
                comment_author_url: cache.author.github.blog,
                comment_content: cache.content,
                is_test: isProd
            }
            const SPAM = this.config.modelValidate.comment.state.optional.SPAM
            if (cache.state === SPAM && state !== SPAM) {
                // 垃圾评论转为正常评论
                if (cache.spam) {
                    body.spam = false
                    // 报告给Akismet
                    this.app.akismet.submitSpam(opt)
                }
            } else if (cache.state !== SPAM && state === SPAM) {
                // 正常评论转为垃圾评论
                if (!cache.spam) {
                    body.spam = true
                    // 报告给Akismet
                    this.app.akismet.submitHam(opt)
                }
            }
        }
        let data = null
        if (!ctx._isAuthed) {
            data = await this.updateById(id, comment).select('-content -state -updatedAt')
                .populate({
                    path: 'author',
                    select: 'github'
                })
                .populate({
                    path: 'parent',
                    select: 'author meta sticky ups'
                })
                .populate({
                    path: 'forward',
                    select: 'author meta sticky ups'
                }).exec()
        } else {
            data = await this.updateById(id, comment).exec()
        }
        data
            ? ctx.success(data, '评论更新成功')
            : ctx.fail('评论更新失败')
    }

    async delete () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        const data = await this.deleteById(params.id).exec()
        return data && data.ok && data.n
    }

    async like () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        return await this.updateById(params.id, {
            $inc: {
                ups: 1
            }
        })
    }

    async sendCommentEmailToAdminAndUser (comment) {
        const { type, article } = comment
        const commentType = this.config.modelValidate.comment.type.optional
        const permalink = this.getPermalink(comment)
        let adminTitle = '未知的评论'
        let adminType = '评论'
        if (type === commentType.COMMENT) {
            // 文章评论
            const at = await this.service.article.findById(article).exec().catch(() => null)
            if (at && at._id) {
                adminTitle = `博客文章 [${at.title}] 有了新的评论`
            }
            adminType = '评论'
        } else if (type === commentType.MESSAGE) {
            // 站内留言
            adminTitle = `个人站点有新的留言`
            adminType = '留言'
        }

        // 发送给管理员邮箱config.email
        this.service.common.sendMail({
            subject: adminTitle,
            text: `来自 ${comment.author.name} 的${adminType}：${comment.content}`,
            html: `<p>来自 <a href="${comment.author.github.blog || 'javascript:;'}" target="_blank">${comment.author.name}</a> 的${adminType} <a href="${permalink}" target="_blank">[ 点击查看 ]</a>：${comment.renderedContent}</p>`
        }, true)

        // 发送给被评论者
        if (comment.forward && comment.forward._id !== comment.author._id) {
            const forwardAuthor = await this.service.user.findById(comment.forward.author).exec().catch(() => null)
            if (forwardAuthor) {
                this.service.comment.sendMail({
                    to: forwardAuthor.github.email,
                    subject: '你在 Jooger 的博客的评论有了新的回复',
                    text: `来自 ${comment.author.name} 的回复：${comment.content}`,
                    html: `<p>来自 <a href="${comment.author.github.blog || 'javascript:;'}" target="_blank">${comment.author.name}</a> 的回复 <a href="${permalink}" target="_blank">[ 点击查看 ]</a>：${comment.renderedContent}</p>`
                })
            }
        }
    }

    getPermalink (comment = {}) {
        const { type, article } = comment
        const commentType = this.config.modelValidate.comment.type.optional
        switch (type) {
        case commentType.COMMENT:
            return `${this.config.author.url}/articles/${article}`
        case commentType.MESSAGE:
            return `${this.config.author.url}/guestbook`
        default:
            return ''
        }
    }
}

// 评论类型说明
function getCommentType (type) {
	switch (type) {
	case 0:
		return '文章评论'
	case 1:
		return '站点留言'
	default:
		return '评论'
	}
}
