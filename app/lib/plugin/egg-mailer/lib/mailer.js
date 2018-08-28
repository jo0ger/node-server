const nodemailer = require('nodemailer')

module.exports = app => {
    app.addSingleton('mailer', createClient)
}

function createClient (config) {
    return {
        client: null,
        getClient (opt) {
            return this.client || (this.client = nodemailer.createTransport(Object.assign({}, config, opt)))
        },
        async verify () {
            await new Promise((resolve, reject) => {
                if (!this.client) {
                    return resolve()
                }
                this.client.verify(err => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve()
                    }
                })
            })
        }
    }
}
