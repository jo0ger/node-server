/**
 * @desc 统计模型
 */

module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const statValidateConfig = config.modelEnum.stat

    const StatSchema = new Schema({
        // 类型
        type: {
            type: Number,
            required: true,
            validate: val => Object.values(statValidateConfig.type.optional).includes(val)
        },
        // 统计目标
        target: {
            keyword: { type: String, required: false },
            article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: false },
            category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
            tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: false }
        },
        // 统计项
        stat: {
            count: { type: Number, required: false, default: 0 }
        },
        // 创建日期
        createdAt: { type: Date, default: Date.now },
        // 更新日期
        updatedAt: { type: Date, default: Date.now }
    })

    return mongoose.model('Stat', app.processSchema(StatSchema))
}
