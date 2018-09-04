const akismet = require('akismet-api')

module.exports = app => {
    app.addSingleton('akismet', createClient)
    app.beforeStart(() => {
        app.akismet.verifyKey().then(valid => {
            if (valid) {
                app.coreLogger.info('[egg-akismet] 服务启动成功')
                app._akismetValid = true
            } else {
                app.coreLogger.error('[egg-akismet] 服务启动失败：无效的Apikey')
            }
        }).catch(err => {
            app.coreLogger.error('[egg-akismet] ' + err.message)
        })
    })
}

function createClient (config) {
    return akismet.client(config)
}
