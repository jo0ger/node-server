const akismet = require('akismet')

module.exports = app => {
    app.addSingleton('akismet', createClient)
    app.beforeStart(async () => {
        const { valid, error } = await app.akismet.verifyKey()
        if (valid) {
            app.coreLogger.info('[egg-akismet] 服务启动成功')
        } else {
            app.coreLogger.error(`[egg-akismet] 服务启动失败：${error}`)
        }
    })
}

function createClient (config, app) {
    return new AkismetClient(config, app)
}

// Akismet apikey是否验证通过
let isValidKey = false

/**
 * @desc Akismet Client Class
 * @param {String} key       Akismet apikey
 * @param {String} blog      Akismet blog
 */
class AkismetClient {
    constructor (config, app) {
        this.config = config
        this.app = app
        this.init()
    }

    init () {
        this.client = akismet.client(this.config)
    }

    async verifyKey () {
        let valid = true
        let error = ''
        if (!isValidKey) {
            const v = await this.client.verifyKey()
            valid = v
            if (v) {
                isValidKey = true
            } else {
                error = '无效的Apikey'
                this.client = null
            }
        }
        return { valid, error }
    }

    // 检测是否是spam
    checkSpam (opt = {}) {
        this.app.coreLogger.info('验证评论中...')
        return new Promise((resolve, reject) => {
            if (isValidKey) {
                this.client.checkSpam(opt, (err, spam) => {
                    if (err) {
                        this.app.coreLogger.error('[egg-akismet] 评论验证失败，将跳过Spam验证，错误：', err.message)
                        return reject(false)
                    }
                    if (spam) {
                        this.app.coreLogger.warn('[egg-akismet] 评论验证不通过，疑似垃圾评论')
                        resolve(true)
                    } else {
                        this.app.coreLogger.info('[egg-akismet] 评论验证通过')
                        resolve(false)
                    }
                })
            } else {
                this.app.coreLogger.warn('[egg-akismet] Apikey未认证，将跳过Spam验证')
                resolve(false)
            }
        })
    }

    // 提交被误检为spam的正常评论
    submitSpam (opt = {}) {
        this.app.coreLogger.info('[egg-akismet] 误检Spam垃圾评论报告提交中...')
        return new Promise((resolve, reject) => {
            if (isValidKey) {
                this.client.submitSpam(opt, err => {
                    if (err) {
                        this.app.coreLogger.error('[egg-akismet] 误检Spam垃圾评论报告提交失败')
                        return reject(err)
                    }
                    this.app.coreLogger.info('[egg-akismet] 误检Spam垃圾评论报告提交成功')
                    resolve()
                })
            } else {
                this.app.coreLogger.warn('[egg-akismet] Apikey未认证，误检Spam垃圾评论报告提交失败')
                resolve()
            }
        })
    }

    // 提交被误检为正常评论的spam
    submitHam (opt = {}) {
        this.app.coreLogger.info('[egg-akismet] 误检正常评论报告提交中...')
        return new Promise((resolve, reject) => {
            if (isValidKey) {
                this.client.submitSpam(opt, err => {
                    if (err) {
                        this.app.coreLogger.error('[egg-akismet] 误检正常评论报告提交失败')
                        return reject(err)
                    }
                    this.app.coreLogger.info('[egg-akismet] 误检正常评论报告提交成功')
                    resolve()
                })
            } else {
                this.app.coreLogger.warn('[egg-akismet] Apikey未认证，误检正常评论报告提交失败')
                resolve()
            }
        })
    }
}
