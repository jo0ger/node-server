/**
 * @desc User Services
 */

const ProxyService = require('./proxy')

module.exports = class UserService extends ProxyService {
    get model () {
        return this.app.model.User
    }

    // 创建用户
    async create (user) {
        const { name } = user
        const exist = await this.getItem({ name })
        if (exist) {
            this.logger.info('用户已存在，无需创建：' + name)
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

    /**
     * @desc 评论用户创建或更新
     * @param {*} author 评论的author
     * @return {User} user
     */
    async checkCommentAuthor (author) {
        let user = null
        let error = ''
        const { isObjectId, isObject } = this.app.utils.validate
        if (isObjectId(author)) {
            user = await this.getItemById(author)
        } else if (isObject(author)) {
            const update = {}
            author.name && (update.name = author.name)
            author.site && (update.site = author.site)
            author.email && (update.email = author.email)
            update.avatar = this.app.utils.gravatar(author.email)
            const id = author.id || author._id
            if (id) {
                // 更新
                if (isObjectId(id)) {
                    user = await this.getItemById(id)
                    const hasDiff = user && Object.keys(update).some(key => update[key] !== user[key])
                    if (hasDiff) {
                        // 有变动才更新
                        user = await this.updateItemById(id, update)
                        if (user) {
                            this.logger.info('用户更新成功：' + user.name)
                            this.service.notification.recordUser(user, 'update')
                        }
                    }
                }
            } else {
                user = await this.getItem({ name: author.name })
                if (user) {
                    // 名称重复，不能创建评论
                    user = null
                    error = '用户名重复，请修改后再提交'
                } else {
                    // 可以创建
                    user = await this.create(Object.assign(update, {
                        role: this.config.modelEnum.user.role.optional.NORMAL
                    }))
                    if (user) {
                        this.service.notification.recordUser(user, 'create')
                        this.service.stat.record('USER_CREATE', { user: user._id }, 'count')
                    }
                }
            }
        }
        if (!user && !error) {
            error = '用户不存在'
        }
        return { user, error }
    }

    /**
     * @desc 检测用户以往spam评论
     * @param {User} user 评论作者
     * @return {Boolean} 是否能发布评论
     */
    async checkUserSpam (user) {
        if (!user) return
        const comments = await this.service.comment.getList({ author: user._id })
        const spams = comments.filter(c => c.spam)
        if (spams.length >= this.app.setting.limit.commentSpamMaxCount) {
            // 如果已存在垃圾评论数达到最大限制
            if (!user.mute) {
                user = await this.updateItemById(user._id, { mute: true })
                this.logger.info(`用户禁言成功：${user.name}`)
            }
            return false
        }
        return true
    }
}
