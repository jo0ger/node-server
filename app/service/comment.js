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
            create: {
                content: { type: 'string', required: true },
                state: { type: 'enum', values: this.config.modelValidate.comment.state.optional, required: false },
                sticky: { type: 'boolean', required: false },
                type: { type: 'enum', values: this.config.modelValidate.comment.type.optional, required: false },
                article: { type: 'objectId', required: false },
                partner: { type: 'objectId', required: false },
                forward: { type: 'objectId', required: false },
                author: { type: 'object', required: true }
            }
        }
    }

    async list () {}

    async item () {}

    async create () {
        const { ctx } = this
        const body = ctx.validateBody(this.rules.create)
        const { article, parent, forward } = body
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
        const isAdmin = user.role === this.config.modelValidate.user.role.optional.ADMIN
        const { ip, location } = ctx.getLocation()
        body.meta = {
            location,
            ip,
            ua: ctx.req.headers['user-agent'] || '',
            referer: ctx.req.headers['referer'] || ''
        }
    }

    async update () {}

    async delete () {
        const { ctx } = this
        ctx.validateParamsObjectId()
    }

    async like () {}
}
