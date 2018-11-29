/**
 * @desc 设置参数模型
 */

module.exports = app => {
    const { mongoose } = app
    const { Schema } = mongoose

    const SettingSchema = new Schema({
        // 站点设置
        site: {
            logo: { type: String, validate: app.utils.validate.isUrl },
            welcome: { type: String, default: '' },
            links: [{
                id: { type: Schema.Types.ObjectId, required: true },
                name: { type: String, required: true },
                github: { type: String, default: '' },
                avatar: { type: String, default: '' },
                slogan: { type: String, default: '' },
                site: { type: String, required: true }
            }],
            musicId: { type: String, default: '' }
        },
        // 个人信息
        personal: {
            slogan: { type: String, default: '' },
            description: { type: String, default: '' },
            tag: [{ type: String }],
            hobby: [{ type: String }],
            skill: [{ type: String }],
            location: { type: String, default: '' },
            company: { type: String, default: '' },
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            github: { type: Object, default: {} }
        },
        // 第三方插件的参数
        keys: {
            // 阿里云oss
            aliyun: {
                accessKeyId: { type: String, default: '' },
                accessKeySecret: { type: String, default: '' },
                bucket: { type: String, default: '' },
                region: { type: String, default: '' }
            },
            // 阿里node平台
            alinode: {
                appid: { type: String, default: '' },
                secret: { type: String, default: '' }
            },
            aliApiGateway: {
                // 查询IP
                ip: {
                    appCode: { type: String, default: '' }
                }
            },
            // 163邮箱
            mail: {
                user: { type: String, default: '' },
                pass: { type: String, default: '' }
            },
            // gayhub
            github: {
                clientID: { type: String, default: '' },
                clientSecret: { type: String, default: '' }
            },
            // 百度seo token
            baiduSeo: {
                token: { type: String, default: '' }
            }
        },
        limit: {
            articleCount: { type: Number, default: 10 },
            commentCount: { type: Number, default: 20 },
            relatedArticleCount: { type: Number, default: 10 },
            hotArticleCount: { type: Number, default: 7 },
            commentSpamMaxCount: { type: Number, default: 3 },
            momentCount: { type: Number, default: 10 }
        }
    })

    return mongoose.model('Setting', app.processSchema(SettingSchema))
}
