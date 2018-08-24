module.exports = appInfo => {
    const config = exports = {}

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1534765762288_2697'

    config.version = appInfo.pkg.version

    config.site = appInfo.pkg.author.site

    config.isLocal = appInfo.env === 'local'

    config.isProd = appInfo.env === 'prod'

    // add your config here
    config.middleware = [
        'gzip',
        'response',
        'error',
        'headers'
    ]

    config.session = {
        key: appInfo.name + '-token',
        maxAge: 60000 * 60 * 24 * 7,
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

    // mongoose配置
    config.mongoose = {
        url: 'mongodb://127.0.0.1/node-server',
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
                host: '127.0.0.1',
                port: 6379,
                db: 0,
                password: appInfo.name
            },
            util: {
                host: '127.0.0.1',
                port: 6379,
                db: 1,
                password: appInfo.name
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

    config.modelValidate = {
        article: {
            // 文章状态 （ 0 草稿(默认) | 1 已发布 ）
            state: {
                default: '0',
                optional: {
                    DRAFT: '0',
                    PUBLISH: '1'
                }
            }
        },
        user: {
            // 角色 0 管理员 | 1 普通用户 | 2 gayhub用户，不能更改
            role: {
                default: '1',
                optional: {
                    ADMIN: '0',
                    NORMAL: '1',
                    GAYHUB: '2'
                }
            }
        },
        comment: {
            // 状态 -2 垃圾评论 | -1 已删除 | 0 待审核 | 1 通过
            state: {
                default: '1',
                optional: {
                    SPAM: '-2',
                    DELETED: '-1',
                    AUDITING: '0',
                    PASS: '1'
                }
            },
            // 类型 0 文章评论 | 1 站内留言 | 2 其他（保留）
            type: {
                default: '0',
                optional: {
                    COMMENT: '0',
                    MESSAGE: '1',
                    OTHER: '2'
                }
            },
            // 是否置顶 0 否 | 1 是
            sticky: {
                default: '0',
                optional: {
                    NORMAL: '0',
                    STICKY: '1'
                }
            }
        }
    }

    // 初始化管理员，默认的名称和密码，名称需要是github名称
    config.defaultAdmin = {
        name: appInfo.pkg.author.name,
        password: 'admin123456'
    }

    return config
}
