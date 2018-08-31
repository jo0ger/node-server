/**
 * @desc 通告模型
 */

module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const notificationValidateConfig = config.modelEnum.notification

    const NotificationSchema = new Schema({
        // 通知类型 0 系统通知 | 1 评论通知 | 2 点赞通知 | 3 用户操作通知
        type: {
            type: Number,
            required: true,
            validate: val => Object.values(notificationValidateConfig.type.optional).includes(val)
        },
        // 类型细化分类
        classify: {
            type: String,
            required: true,
            validate: val => Object.values(notificationValidateConfig.classify.optional).includes(val)
        },
        // 是否已读
        viewed: { type: Boolean, default: false, required: true },
        // 操作简语
        verb: { type: String, required: true, default: '' },
        target: {
            // article user comment 根据情况是否包含
            article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
        },
        actors: {
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        }
    })

    return mongoose.model('Notification', app.processSchema(NotificationSchema, {
        paginate: true
    }))
}
