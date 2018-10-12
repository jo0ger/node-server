/**
 * @desc 用户模型
 */

module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const userValidateConfig = config.modelEnum.user

    const UserSchema = new Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, validate: app.utils.validate.isEmail },
        avatar: { type: String, required: true },
        site: { type: String, validate: app.utils.validate.isUrl },
        // 角色 0 管理员 | 1 普通用户
        role: {
            type: Number,
            default: userValidateConfig.role.default,
            validate: val => Object.values(userValidateConfig.role.optional).includes(val)
        },
        // role = 0的时候才有该项
        password: { type: String },
        // 是否被禁言
        mute: { type: Boolean, default: false }
    })

    return mongoose.model('User', app.processSchema(UserSchema))
}

