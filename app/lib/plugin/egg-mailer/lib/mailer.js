const nodemailer = require('nodemailer')

module.exports = app => {
    app.addSingleton('mailer', createClient)
}

function createClient (config, app) {
    return {
        client: null,
        getClient (opt) {
            if (!this.client) {
                try {
                    this.client = nodemailer.createTransport(Object.assign({}, config, opt))
                } catch (err) {
                    app.coreLogger.error('[egg-mailer] 邮件客户端初始化失败，错误：' + err.message)
                }
            }
            return this.client
        },
        async verify () {
            await new Promise((resolve, reject) => {
                if (!this.client) {
                    return resolve()
                }
                this.client.verify(err => {
                    if (err) {
                        app.coreLogger.error('[egg-mailer] ' + err.message)
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }
}
