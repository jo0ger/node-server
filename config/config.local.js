'use strict'

module.exports = () => {
    const config = exports = {}

    config.logger = {
        level: 'DEBUG',
        consoleLevel: 'DEBUG',
    }

    config.security = {
        domainWhiteList: [
            'http://localhost:8080',
            'http://127.0.0.1:8080'
        ],
        csrf: {
            ignore: () => true
        }
    }

    // 本地开发调试用
    config.github = {
        clientId: '5b4d4a7945347d0fd2e2',
        clientSecret: '8771bd9ae52749cc15b0c9e2c6cb4ecd7f39d9da'
    }

    return config
}
