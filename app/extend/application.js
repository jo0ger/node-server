module.exports = {
    // model schema处理
    processSchema (schema) {
        if (!schema) {
            return null
        }
        schema.set('versionKey', false)
        schema.set('toObject', { getters: true })
        schema.set('toJSON', { getters: true, virtuals: false })
        return schema
    }
}