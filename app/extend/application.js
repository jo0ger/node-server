const mongoosePaginate = require('mongoose-paginate-v2')

module.exports = {
    // model schema处理
    processSchema (schema, paginate) {
        if (!schema) {
            return null
        }
        schema.set('versionKey', false)
        schema.set('toObject', { getters: true })
        schema.set('toJSON', { getters: true, virtuals: false })
        if (paginate) {
            schema.plugin(mongoosePaginate)
        }
        return schema
    }
}
