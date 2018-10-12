/**
 * @desc Mail Services
 */

const { Service } = require('egg')

let mailerClient = null

module.exports = class MailService extends Service {
    // 发送邮件
    async send (type, data, toAdmin = false) {
        let client = mailerClient
        const keys = this.app.setting.keys
        if (!client) {
            mailerClient = client = this.app.mailer.getClient({
                auth: keys.mail
            })
            await this.app.mailer.verify().catch(err => {
                this.service.notification.recordGeneral('MAIL', 'VERIFY_FAIL', err)
            })
        }
        const opt = Object.assign({
            from: `${this.config.author.name} <${keys.mail.user}>`
        }, data)
        if (toAdmin) {
            opt.to = keys.mail.user
        }
        type = type ? `[${type}]` : ''
        toAdmin = toAdmin ? '管理员' : ''
        await new Promise((resolve, reject) => {
            client.sendMail(opt, (err, info) => {
                if (err) {
                    this.logger.error(type + toAdmin + ' 邮件发送失败，TO：' + opt.to + '，错误：' + err.message)
                    this.service.notification.recordGeneral('MAIL', 'SEND_FAIL', err)
                    return reject(err)
                }
                this.logger.info(type + toAdmin + ' 邮件发送成功，TO：' + opt.to)
                resolve(info)
            })
        })
    }

    sendToAdmin (type, data) {
        return this.send(type, data, true)
    }
}
