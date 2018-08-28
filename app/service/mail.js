/**
 * @desc Mail Services
 */

const { Service } = require('egg')

let mailerClient = null

module.exports = class MailService extends Service {
    // 发送邮件
    async send (data, toAdmin = false) {
        let client = mailerClient
        const keys = this.app.setting.keys
        if (!client) {
            mailerClient = client = this.app.mailer.getClient({
                auth: keys.mail
            })
            await this.app.mailer.verify()
        }
        const opt = Object.assign({
            from: `${this.config.author.name} <${keys.mail.user}>`
        }, data)
        if (toAdmin) {
            opt.to = keys.mail.user
        }
        await new Promise((resolve, reject) => {
            client.sendMail(opt, (err, info) => {
                if (err) {
                    this.logger.error('邮件发送失败，' + err.message)
                    return reject(err)
                }
                this.logger.info('邮件发送成功，TO：' + opt.to)
                resolve(info)
            })
        })
    }

    sendToAdmin (data) {
        return this.send(data, true)
    }
}
