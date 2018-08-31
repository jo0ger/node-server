/**
 * @desc 通告 Services
 */

const ProxyService = require('./proxy')

module.exports = class NotificationService extends ProxyService {
    get model () {
        return this.app.model.Notification
    }

    get notificationConfig () {
        return this.config.modelEnum.notification
    }

    // 记录通告
    async record (typeKey, model, action, target, actors) {
        if (!typeKey || !model || !action) return
        const modelName = this.app.utils.validate.isString(model)
            ? model
            : model.modelName.toLocaleUpperCase()
        const type = this.notificationConfig.type.optional[typeKey]
        const classifyKey = [typeKey, modelName, action].join('_')
        const classify = this.notificationConfig.classify.optional[classifyKey]
        const verb = this.genVerb(classifyKey)
        const payload = { type, classify, verb, target, actors }
        const data = await this.create(payload)
        if (data) {
            this.logger.info(`通告生成成功，[id: ${data._id}] [type：${typeKey}]，[classify: ${classifyKey}]`)
        }
    }

    // 记录评论相关动作
    async recordComment (comment, handle = 'create') {
        if (!comment || !comment._id) return
        const target = {}
        const actors = {}
        let action = ''
        comment = await this.service.comment.getItemById(comment._id)
        if (!comment) return
        const { COMMENT, MESSAGE } = this.config.modelEnum.comment.type.optional
        const { type, forward, article, author } = comment
        actors.from = author._id || author
        target.comment = comment._id
        if (type === COMMENT) {
            // 文章评论
            action += 'COMMENT'
            if (handle === 'create') {
                target.article = article._id || article
            }
        } else if (type === MESSAGE) {
            // 站内留言
            action += 'MESSAGE'
        }
        if (handle === 'create') {
            if (forward) {
                action += '_REPLY'
                const forwardId = forward._id || forward
                target.comment = forwardId
                const forwardItem = await this.service.comment.getItemById(forwardId)
                actors.to = forwardItem.author._id
            }
        } else if (handle === 'update') {
            // 更新
            action += '_UPDATE'
        }
        this.record('COMMENT', 'COMMENT', action, target, actors)
    }

    recordLike (type, model, user, like = false) {
        const { COMMENT, MESSAGE } = this.config.modelEnum.comment.type.optional
        let modelName = ''
        let action = ''
        const actionSuffix = like ? 'LIKE' : 'UNLIKE'
        const target = {}
        const actors = {}
        if (user) {
            actors.from = user._id || user
        }
        if (type === 'article') {
            // 文章
            modelName = 'ARTICLE'
            target.article = model._id
        } else if (type === 'comment') {
            // 评论
            modelName = 'COMMENT'
            target.comment = model._id
            if (model.type === COMMENT) {
                action += 'COMMENT_'
            } else if (model.type === MESSAGE) {
                action += 'MESSAGE_'
            }
        }
        action += actionSuffix
        this.record('LIKE', modelName, action, target, actors)
    }

    recordUser (user, handle) {
        let action = ''
        const target = {
            user: user._id || user
        }
        const actors = {
            from: target.user
        }
        if (handle === 'create') {
            action += 'CREATE'
        } else if (handle === 'update') {
            action += 'UPDATE'
        } else if (handle === 'mute') {
            action += 'MUTE_AUTO'
        }
        this.record('USER', 'USER', action, target, actors)
    }

    // 获取操作简语
    genVerb (classify) {
        const verbMap = {
            // type === 1，评论通知
            COMMENT_COMMENT_COMMENT: '评论了文章',
            COMMENT_COMMENT_COMMENT_REPLY: '回复了评论',
            COMMENT_COMMENT_COMMENT_UPDATE: '更新了评论',
            COMMENT_COMMENT_MESSAGE: '在站内留言',
            COMMENT_COMMENT_MESSAGE_REPLY: '回复了留言',
            COMMENT_COMMENT_MESSAGE_UPDATE: '更新了留言',
            // type === 2，点赞通知
            LIKE_ARTICLE_LIKE: '给文章点了赞',
            LIKE_ARTICLE_UNLIKE: '取消了文章点赞',
            LIKE_COMMENT_COMMENT_LIKE: '给评论点了赞',
            LIKE_COMMENT_MESSAGE_LIKE: '给留言点了赞',
            LIKE_COMMENT_COMMENT_UNLIKE: '取消了评论点赞',
            LIKE_COMMENT_MESSAGE_UNLIKE: '取消了留言点赞',
            // type === 3, 用户操作通知
            USER_USER_MUTE_AUTO: '用户被自动禁言',
            USER_USER_CREATE: '新增用户',
            USER_USER_UPDATE: '更新用户信息'
        }
        return verbMap[classify]
    }
}
