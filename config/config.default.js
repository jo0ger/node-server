'use strict'

module.exports = appInfo => {
    const config = exports = {}

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1534765762288_2697'

    config.version = appInfo.pkg.version

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
        signed: false
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

    // allowed origins
    config.allowedOrigins = ['jooger.me', 'www.jooger.me', 'admin.jooger.me']

    // 请求响应code
    config.codeMap = {
        '-1': '请求失败',
        '200': '请求成功',
        '401': '权限校验失败',
        '403': 'Forbidden',
        '404': '资源未找到',
        '422': '参数校验失败',
        '500': '服务器错误'
    }

    config.modelValidate = {
        article: {
            // 文章状态 （ 0 草稿(默认) | 1 已发布 ）
            state: {
                default: 0,
                optional: {
                    'DRAFT': 0,
                    'PUBLISH': 1
                }
            }
        }
    }

    return config
}
