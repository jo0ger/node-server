/**
 * @desc 公共的model proxy service
 */

const { Service } = require('egg')

module.exports = class ProxyService extends Service {
    init () {
        return this.model.init()
    }

    getList (query, select = null, opt, populate = []) {
        const Q = this.model.find(query, select, opt)
        if (populate) {
            [].concat(populate).forEach(item => Q.populate(item))
        }
        return Q.exec()
    }

    async getLimitListByQuery (query, opt) {
        opt = Object.assign({ lean: true }, opt)
        const data = await this.model.paginate(query, opt)
        return this.app.getDocsPaginationData(data)
    }

    getItem (query, select = null, opt, populate = []) {
        opt = this.app.merge({
            lean: true
        }, opt)
        let Q = this.model.findOne(query, select, opt)
        if (populate) {
            [].concat(populate).forEach(item => {
                Q = Q.populate(item)
            })
        }
        return Q.exec()
    }

    getItemById (id, select = null, opt, populate = []) {
        opt = this.app.merge({
            lean: true
        }, opt)
        const Q = this.model.findById(id, select, opt)
        if (populate) {
            [].concat(populate).forEach(item => Q.populate(item))
        }
        return Q.exec()
    }

    async create (payload) {
        const data = await this.model.create(payload)
        const modelName = this.model.modelName
        // FIX:  触发通告，待优化
        const n = this.service.notification
        const record = n.record.bind(n)
        const target = {}
        let action = ''
        if (modelName === 'Comment') {
            target.comment = data._id
            // 评论|留言创建
            if (data._id !== this.app._admin._id) {
                // 非管理员才触发
                const { COMMENT, MESSAGE } = this.config.modelValidate.comment.type.optional
                if (data.type === COMMENT) {
                    // 文章评论
                    if (data.parent) {
                        // 评论回复
                        action = 'COMMENT_REPLY'
                    } else {
                        // 评论，非回复
                        action = 'COMMENT'
                    }
                } else if (data.type === MESSAGE) {
                    // 站内留言
                    if (data.parent) {
                        // 留言回复
                        action = 'MESSAGE_REPLY'
                    } else {
                        // 留言，非回复
                        action = 'MESSAGE'
                    }
                }
            }
        } else if (modelName === 'User') {
            target.user = data._id
            // 用户创建
            const { ADMIN } = this.config.modelValidate.user.role.optional
            if (data.role !== ADMIN) {
                // 非管理员才触发
                action = 'CREATE'
            }
        }
        const type = this.service.notification.getTypeByModel(this.model, action)
        record(type.type, type.classify, target)
        return data
    }

    updateItem (query = {}, data, opt, populate = []) {
        opt = this.app.merge({
            lean: true,
            new: true
        })
        const Q = this.model.findOneAndUpdate(query, data, opt)
        if (populate) {
            [].concat(populate).forEach(item => Q.populate(item))
        }
        return Q.exec()
    }

    updateItemById (id, data, opt, populate = []) {
        opt = this.app.merge({
            lean: true,
            new: true
        })
        const Q = this.model.findByIdAndUpdate(id, data, opt)
        if (populate) {
            [].concat(populate).forEach(item => Q.populate(item))
        }
        return Q.exec()
    }

    updateMany (query, data, opt) {
        return this.model.updateMany(query, data, opt)
    }

    updateManyById (id, data, opt) {
        return this.updateMany({ _id: id }, data, opt)
    }

    deleteItemById (id, opt) {
        return this.model.findByIdAndDelete(id, opt).exec()
    }

    aggregate (pipeline = []) {
        return this.model.aggregate(pipeline)
    }
}
