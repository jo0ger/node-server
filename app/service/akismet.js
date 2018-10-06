/**
 * @desc Akismet Services
 */

const { Service } = require('egg')

module.exports = class AkismetService extends Service {
    checkSpam (opt = {}) {
        this.app.coreLogger.info('验证评论中...')
        return new Promise(resolve => {
            if (this.app._akismetValid) {
                this.app.akismet.checkSpam(opt, (err, spam) => {
                    if (err) {
                        this.app.coreLogger.error('评论验证失败，将跳过Spam验证，错误：', err.message)
                        this.service.notification.recordGeneral('AKISMET', 'CHECK_FAIL', err)
                        return resolve(false)
                    }
                    if (spam) {
                        this.app.coreLogger.warn('评论验证不通过，疑似垃圾评论')
                        resolve(true)
                    } else {
                        this.app.coreLogger.info('评论验证通过')
                        resolve(false)
                    }
                })
            } else {
                this.app.coreLogger.warn('Apikey未认证，将跳过Spam验证')
                resolve(false)
            }
        })
    }

    // 提交被误检为spam的正常评论
    submitSpam (opt = {}) {
        this.app.coreLogger.info('误检Spam垃圾评论报告提交中...')
        return new Promise((resolve, reject) => {
            if (this.app._akismetValid) {
                this.app.akismet.submitSpam(opt, err => {
                    if (err) {
                        this.app.coreLogger.error('误检Spam垃圾评论报告提交失败')
                        this.service.notification.recordGeneral('AKISMET', 'CHECK_FAIL', err)
                        return reject(err)
                    }
                    this.app.coreLogger.info('误检Spam垃圾评论报告提交成功')
                    resolve()
                })
            } else {
                this.app.coreLogger.warn('Apikey未认证，误检Spam垃圾评论报告提交失败')
                resolve()
            }
        })
    }

    // 提交被误检为正常评论的spam
    submitHam (opt = {}) {
        this.app.coreLogger.info('误检正常评论报告提交中...')
        return new Promise((resolve, reject) => {
            if (this.app._akismetValid) {
                this.app.akismet.submitSpam(opt, err => {
                    if (err) {
                        this.app.coreLogger.error('误检正常评论报告提交失败')
                        this.service.notification.recordGeneral('AKISMET', 'CHECK_FAIL', err)
                        return reject(err)
                    }
                    this.app.coreLogger.info('误检正常评论报告提交成功')
                    resolve()
                })
            } else {
                this.app.coreLogger.warn('Apikey未认证，误检正常评论报告提交失败')
                resolve()
            }
        })
    }
}
