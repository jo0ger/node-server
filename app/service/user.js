/**
 * @desc User Services
 */

const ProxyService = require('./proxy')

module.exports = class UserService extends ProxyService {
    get model () {
        return this.app.model.User
    }

    get rules () {
        return {
            // TODO:
        }
    }

    async list () {
        const { ctx } = this
        let select = '-password'
        if (!ctx._isAuthenticated) {
            select += ' -createdAt -updatedAt -role'
        }
        return await this.find()
            .sort('-createdAt')
            .select(select)
            .exec()
    }

    async item () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateParamsObjectId()
        let select = '-password'
        if (!ctx._isAuthenticated) {
            select += ' -createdAt -updatedAt -github'
        }
        return await this.findById(params.id).select(select).exec()
    }

    async checkCommentAuthor (author) {
        let user = null
        const { isObjectId, isObject } = this.app.utils.validate
        if (isObjectId(author)) {
            user = this.findById(author).select('-password').exec90
        } else if (isObject(author)) {
            const update = {}
            author.name && (update.name = author.name)
            author.site && (update.site = author.site)
            if (author.email) {
                update.avatar = this.app.utils.gravatar(author.email)
                update.email = author.email
            }
            if (author.id) {
                // 更新
                if (isObjectId(author.id)) {
                    user = await this.updateById(author.id, update).exec()
                    if (user) {
                        this.logger.info(`用户【${user.name}】更新成功`)
                    }
                }
            } else {
                // 创建
                user = await this.newAndSave(Object.assign(update, {
                    role: config.constant.roleMap.USER
                }))
                if (user) {
                    this.logger.info(`用户【${user.name}】创建成功`)
                }
            }
        }
    }

    // 检测用户以往spam评论
    async checkUserSpam (user) {
        const comments = await this.service.comment.find({ author: user._id }).exec()
        const spams = comments.filter(c => c.spam)
        if (spams.length >= this.config.limit.commentSpamLimit) {
            if (!user.mute) {
                await this.updateById(user._id, { mute: true }).exec()
                this.logger.info(`用户【${user.name}】禁言成功`)
            }
            return false
        }
        return true
    }
}
