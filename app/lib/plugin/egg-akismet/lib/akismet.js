const akismet = require('akismet-api')

module.exports = app => {
    app.addSingleton('akismet', createClient)
    app.beforeStart(async () => {
        try {
            const valid = await app.akismet.verifyKey()
            if (valid) {
                app.coreLogger.info('[egg-akismet] 服务启动成功')
                app._akismetValid = true
            } else {
                app.coreLogger.error('[egg-akismet] 服务启动失败：无效的Apikey')
            }
        } catch (error) {
            app.coreLogger.error('[egg-akismet] ' + error.message)
        }
    })
}

function createClient (config) {
    return akismet.client(config)
}
