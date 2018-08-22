/**
 * @desc 用户模型
 */

module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const userValidateConfig = config.modelValidate.user

    const UserSchema = new Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, validate: app.utils.validate.isEmail },
        avatar: { type: String, required: true },
        site: { type: String, validate: app.utils.validate.isSiteUrl },
        slogan: { type: String },
        description: { type: String, default: '' },
        // 角色 0 管理员 | 1 普通用户 | 2 github用户，不能更改
        role: {
            type: Number,
            default: userValidateConfig.role.default,
            validate: (val) => {
                return Object.values(userValidateConfig.role.optional).includes(val)
            }
        },
        // role = 0的时候才有该项
        password: { type: String },
        // 是否被禁言
        mute: { type: Boolean, default: false },
        company: { type: String, default: '' },
        location: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        // github信息，不能手动更改
        github: {
            id: { type: String, default: '' },
            login: { type: String, default: '' }
        }
    })

    return mongoose.model('User', app.processSchema(UserSchema))
}

