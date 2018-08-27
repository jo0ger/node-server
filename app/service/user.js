/**
 * @desc User Services
 */

const ProxyService = require('./proxy2')

module.exports = class UserService extends ProxyService {
    get model () {
        return this.app.model.User
    }

    // 创建用户
    async create (user) {
        const { name } = user
        const exist = await this.getItem({ name })
        if (exist) {
            return exist
        }
        const data = await new this.model(user).save()
        const type = ['管理员', '用户'][data.role]
        if (data) {
            this.logger.info(`${type}创建成功：${name}`)
        } else {
            this.logger.error(`${type}创建失败：${name}`)
        }
        return data
    }

    async checkCommentAuthor (author) {
        let user = null
        const { isObjectId, isObject } = this.app.utils.validate
        if (isObjectId(author)) {
            user = this.findById(author).select('-password').exec()
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
                        this.logger.info('用户更新成功：' + user.name)
                    }
                }
            } else {
                // 创建
                user = await this.create(Object.assign(update, {
                    role: this.config.modelValidate.user.role.optional.NORMAL
                }))
            }
        }
        return user
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
