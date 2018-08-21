/**
 * @desc 标签模型
 */

module.exports = app => {
    const { mongoose } = app
    const { Schema } = mongoose

    const TagSchema = new Schema({
        // 名称
        name: { type: String, required: true },
        // 描述
        description: { type: String, default: '' },
        // 创建日期
        createdAt: { type: Date, default: Date.now },
        // 更新日期
        updatedAt: { type: Date, default: Date.now },
        // 扩展属性
        extends: [{
            key: { type: String, validate: /\S+/ },
            value: { type: String, validate: /\S+/ }
        }]
    })

    return mongoose.model('Tag', TagSchema)
}
