module.exports = appInfo => {
    const config = exports = {}

    // config.cluster = {
    //     listen: {
    //         port: 3002,
    //         hostname: '127.0.0.1'
    //     }
    // }

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1534765762288_2697'

    config.version = appInfo.pkg.version

    config.author = appInfo.pkg.author

    config.isLocal = appInfo.env === 'local'

    config.isProd = appInfo.env === 'prod'

    // add your config here
    config.middleware = [
        'gzip',
        'response',
        'error',
        'headers'
    ]

    config.security = {
        domainWhiteList: [
            '*.jooger.me',
            'jooger.me',
            'localhost:8081'
        ],
        csrf: {
            enable: false
        }
    }


    config.cors = {
        enable: true,
        credentials: true,
        allowMethods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS'
    }

    config.session = {
        key: appInfo.name + '_token',
        maxAge: 60 * 60 * 24 * 7,
        signed: true
    }

    config.userCookieKey = appInfo.name + '_userid'

    config.secrets = appInfo.name + '_secrets'

    config.bodyParser = {
        jsonLimit: '10mb'
    }

    config.gzip = {
        threshold: 1024
    }

    config.console = {
        debug: true,
        error: true
    }

    config.akismet = {
        client: {
            blog: config.author.url,
            key: '7fa12f4a1d08'
        }
    }

    config.mailer = {
        client: {
            service: '163',
            secure: true
        }
    }

    // mongoose配置
    config.mongoose = {
        url: process.env.EGG_MONGODB_URL || 'mongodb://node-server:node-server@127.0.0.1:27017/node-server',
        options: {
            useNewUrlParser: true,
            poolSize: 20,
            keepAlive: true,
            autoReconnect: true,
            reconnectInterval: 1000,
            reconnectTries: Number.MAX_VALUE
        }
    }

    config.redis = {
        clients: {
            token: {
                host: process.env.EGG_REDIS_HOST || '127.0.0.1',
                port: process.env.EGG_REDIS_PORT || 6379,
                db: 0,
                password: process.env.EGG_REDIS_PASSWORD || appInfo.name
            },
            util: {
                host: process.env.EGG_REDIS_HOST || '127.0.0.1',
                port: process.env.EGG_REDIS_PORT || 6379,
                db: 1,
                password: process.env.EGG_REDIS_PASSWORD || appInfo.name
            }
        }
    }

    // allowed origins
    config.allowedOrigins = ['jooger.me', 'www.jooger.me', 'admin.jooger.me']

    // 请求响应code
    config.codeMap = {
        '-1': '请求失败',
        200: '请求成功',
        401: '权限校验失败',
        403: 'Forbidden',
        404: 'URL资源未找到',
        422: '参数校验失败',
        500: '服务器错误'
    }

    config.modelEnum = {
        article: {
            // 文章状态 （ 0 草稿(默认) | 1 已发布 ）
            state: {
                default: 0,
                optional: {
                    DRAFT: 0,
                    PUBLISH: 1
                }
            },
            // 来源 0 原创 | 1 转载
            source: {
                default: 0,
                optional: {
                    ORIGINAL: 0,
                    REPRINT: 1
                }
            }
        },
        user: {
            // 角色 0 管理员 | 1 普通用户
            role: {
                default: 1,
                optional: {
                    ADMIN: 0,
                    NORMAL: 1
                }
            }
        },
        comment: {
            // 状态 -2 垃圾评论 | -1 已删除 | 0 待审核 | 1 通过
            state: {
                default: 1,
                optional: {
                    SPAM: -2,
                    DELETED: -1,
                    AUDITING: 0,
                    PASS: 1
                }
            },
            // 类型 0 文章评论 | 1 站内留言
            type: {
                default: 0,
                optional: {
                    COMMENT: 0,
                    MESSAGE: 1
                }
            }
        },
        notification: {
            type: {
                optional: {
                    GENERAL: 0,
                    COMMENT: 1,
                    LIKE: 2,
                    USER: 3
                }
            },
            classify: {
                optional: {
                    // 遵循 type_model_action 模式
                    // type === 0，系统通知
                    GENERAL_MAIL_VERIFY_FAIL: 'mail_verify_fail', // 邮件客户端校验失败
                    GENERAL_MAIL_SEND_FAIL: 'mail_send_fail', // 邮件发送失败
                    GENERAL_AKISMET_CHECK_FAIL: 'akismet_check_fail', // akismet检测失败
                    // type === 1，评论通知
                    COMMENT_COMMENT_COMMENT: 'comment_comment', // 评论（非回复）
                    COMMENT_COMMENT_COMMENT_REPLY: 'comment_comment_reply',	// 评论回复
                    COMMENT_COMMENT_COMMENT_UPDATE: 'comment_comment_update', // 评论更新（保留）
                    COMMENT_COMMENT_MESSAGE: 'comment_message',	// 站内留言
                    COMMENT_COMMENT_MESSAGE_REPLY: 'comment_message_reply',	// 站内留言回复
                    COMMENT_COMMENT_MESSAGE_UPDATE: 'comment_message_reply',	// 站内留言更新
                    // type === 2，点赞通知
                    LIKE_ARTICLE_LIKE: 'article_like', // 文章点赞
                    LIKE_ARTICLE_UNLIKE: 'article_unlike', // 文章取消点赞
                    LIKE_COMMENT_COMMENT_LIKE: 'coment_like', // 评论点赞
                    LIKE_COMMENT_MESSAGE_LIKE: 'message_like', // 留言点赞
                    LIKE_COMMENT_MESSAGE_UNLIKE: 'message_unlike', // 留言取消点赞
                    LIKE_COMMENT_COMMENT_UNLIKE: 'comment_unlike', // 评论取消点赞
                    // type === 3, 用户操作通知
                    USER_USER_MUTE_AUTO: 'user_mute_auto', // 用户被自动禁言
                    USER_USER_CREATE: 'user_create', // 用户创建
                    USER_USER_UPDATE: 'user_update' // 用户更新
                }
            }
        },
        stat: {
            type: {
                optional: {
                    // 遵循 target_action 模式
                    KEYWORD_SEARCH: 0, // 文章关键词搜索
                    CATEGORY_SEARCH: 1, // 文章分类搜索
                    TAG_SEARCH: 2, // 文章标签搜索
                    ARTICLE_VIEW: 3, // 文章访问
                    ARTICLE_LIKE: 4, // 文章点赞
                    USER_CREATE: 5 // 用户创建
                }
            }
        }
    }

    // 初始化管理员，默认的名称和密码，名称需要是github名称
    config.defaultAdmin = {
        name: appInfo.pkg.author.name,
        password: 'admin123456'
    }

    config.defaultAvatar = 'https://static.jooger.me/img/common/avatar.png'

    return config
}
