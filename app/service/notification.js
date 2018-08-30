/**
 * @desc 通告 Services
 */

const ProxyService = require('./proxy')

module.exports = class NotificationService extends ProxyService {
    get model () {
        return this.app.model.Notification
    }

    // 记录通告
    async record (type, classify, target = {}) {
        const notificationConfig = this.config.modelValidate.notification
        type = notificationConfig.type.optional[type]
        classify = notificationConfig.classify.optional[classify]
        const payload = Object.assign({ type, classify }, target)
        const data = await this.create(payload)
        if (data) {
            this.logger.info(`通过生成成功，type：${type}，classify: ${type}`)
        }
    }

    getTypeByModel (model, action) {
        const classifyMap = Object.keys(this.config.modelValidate.notification.classify.optional)
        const typeMap = new Map()
        const modelSet = classifyMap.reduce((set, key) => {
            const frag = key.split('_')
            set.add(frag[0])
            const type = frag.pop()
            typeMap.set(frag.join('_'), Number(type))
            return set
        }, new Set())
        const modelName = model.modelName.toLocaleUpperCase()
        if (!modelSet.has(modelName)) return null
        const classifyPrefix = modelName + '_' + action
        const type = typeMap.get(classifyPrefix)
        if (!type) return null
        return {
            type,
            classify: classifyPrefix + '_' + type
        }
    }

    // 获取操作简语
    getVerb () {}
}
