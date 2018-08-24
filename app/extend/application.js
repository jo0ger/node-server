const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = {
    // model schema处理
    processSchema (schema, options = {}, middlewares = {}) {
        if (!schema) {
            return null
        }
        schema.set('versionKey', false)
        schema.set('toObject', { getters: true })
        schema.set('toJSON', { getters: true, virtuals: false })
        if (options.paginate) {
            schema.plugin(mongoosePaginate)
        }
        schema.pre('findOneAndUpdate', function (next) {
            this._update.updatedAt = Date.now()
            next()
        })
        Object.keys(middlewares).forEach(key => {
            const fns = middlewares[key]
            Object.keys(fns).forEach(action => {
                schema[key](action, fns[action])
            })
        })
        return schema
    }
}
