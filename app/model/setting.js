/**
 * @desc 设置参数模型
 */

module.exports = app => {
    const { mongoose } = app
    const { Schema } = mongoose

    const SettingSchema = new Schema({
        // 站点设置
        site: {
            welcome: { type: String, default: '' },
            description: { type: String, default: '' },
            hobby: { type: String, default: '' },
            skill: { type: String, default: '' },
            music: { type: String, default: '' },
            location: { type: String, default: '' },
            company: { type: String, default: '' },
            links: [{
                name: { type: String, required: true },
                github: { type: String, default: '' },
                avatar: { type: String, default: '' },
                slogan: { type: String, default: '' },
                site: { type: String, required: true }
            }],
            musicId: { type: String, default: '' }
        },
        // 第三方插件的参数
        keys: {
            // 反垃圾邮件
            akismet: {
                apiKey: { type: String, default: '' }
            },
            // 阿里云oss
            aliyun: {
                accessKeyId: { type: String, default: '' },
                accessKeySecret: { type: String, default: '' },
                bucket: { type: String, default: '' },
                region: { type: String, default: '' }
            },
            // 163邮箱
            mail163: {
                password: { type: String, default: '' }
            }
        }
    })

    return mongoose.model('Setting', app.processSchema(SettingSchema))
}
