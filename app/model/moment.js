/**
 * @desc 说说模型
 */

module.exports = app => {
    const { mongoose } = app
    const { Schema } = mongoose

    const MomentSchema = new Schema({
        // 内容
        content: { type: String, required: true },
        // 地点
        location: Object,
        // 扩展属性
        extends: [{
            key: { type: String, validate: /\S+/ },
            value: { type: String, validate: /\S+/ }
        }]
    })

    return mongoose.model('Moment', app.processSchema(MomentSchema, {
        paginate: true
    }))
}
