/**
 * @desc 公共的model proxy service
 */

const { Service } = require('egg')

module.exports = class ProxyService extends Service {
    init () {
        return this.model.init()
    }

    getListByQuery (query, select = null, opt) {
        return this.model.find(query, select, opt).exec()
    }

    getItem (query, select = null, opt) {
        opt = this.app.merge({
            lean: true
        }, opt)
        return this.model.findOne(query, select, opt).exec()
    }

    getItemById (id) {
        return this.getItem({ _id: id })
    }

    create (data) {
        return new this.model(data).save()
    }

    updateById (id, data, opt) {
        opt = this.app.merge({
            lean: true,
            new: true
        })
        return this.model.findByIdAndUpdate(id, data, opt).exec()
    }

    deleteById (id, opt) {
        return this.model.findByIdAndDelete(id, opt).exec()
    }
}
