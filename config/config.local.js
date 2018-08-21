'use strict'

module.exports = appInfo => {
    const config = exports = {}

    config.isDev = true

    config.logger = {
        level: 'DEBUG',
        consoleLevel: 'DEBUG',
    }

    config.security = {
        csrf: {
            ignore: () => true
        }
    }

    return config
}
