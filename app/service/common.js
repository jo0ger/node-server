/**
 * @desc Util Services
 */

const { Service } = require('egg')
const axios = require('axios')

const prefix = 'http://'
let mailerClient = null

module.exports = class UtilService extends Service {
    proxyUrl (url) {
        if (url.startsWith(prefix)) {
            return url.replace(prefix, `${this.app.config.author.url}/proxy/`)
        }
        return url
    }

    async getGithubUserInfo (username) {
        if (!username) return null
        let gayhub = {}
        if (this.config.isLocal) {
            gayhub = this.config.github
        } else {
            const keys = this.service.setting.keys()
            if (!keys || !keys.github) {
                this.logger.warn('未找到gayhub配置')
                return null
            }
            gayhub = keys.github
        }
        const { clientID, clientSecret } = gayhub
        try {
            const res = await axios.get(`https://api.github.com/users/${username}`, {
                params: {
                    client_id: clientID,
                    client_secret: clientSecret
                }
            }, {
                headers: {
                    Accept: 'application/json'
                }
            })
            if (res && res.status === 200) {
                this.logger.info(`【 ${username} 】信息抓取成功`)
                return res.data
            }
            return null
        } catch (error) {
            this.logger.warn(`【 ${username} 】信息抓取失败`)
            this.logger.error(error)
            return null
        }
    }

    async getGithubUsersInfo (usernames = '') {
        if (!usernames) {
            return null
        } else if (this.app.utils.validate.isString(usernames)) {
            usernames = [usernames]
        } else if (!Array.isArray(usernames)) {
            return null
        }
        return await Promise.all(usernames.map(name => this.getGithubUserInfo(name)))
    }

    async getGithubAuthUserInfo (access_token) {
        return await axios.get('https://api.github.com/user', {
            params: { access_token }
        })
    }

    async generateLinks (links = []) {
        if (links && links.length) {
            const githubNames = links.map(link => link.github)
            const usersInfo = await this.getGithubUsersInfo(githubNames)
            if (usersInfo) {
                return links.map((link, index) => {
                    const userInfo = usersInfo[index]
                    if (userInfo) {
                        link.avatar = this.proxyUrl(userInfo.avatar_url)
                        link.slogan = userInfo.bio
                        link.site = link.site || userInfo.blog || userInfo.url
                    }
                    return link
                })
            }
        }
        return links
    }

    // 发送邮件
    async sendMail (data, toMe = false) {
        let client = mailerClient
        const keys = await this.service.setting.keys()
        if (!client) {
            mailerClient = client = this.app.mailer.getClient({
                auth: keys.mail
            })
            await this.app.mailer.verify()
        }
        return new Promise((resolve, reject) => {
            const opt = Object.assign({
                from: `${this.config.author.name} <${keys.mail.user}>`
            }, data)
            if (toMe) {
                opt.to = keys.mail.user
            }
            client.sendMail(opt, (err, info) => {
                if (err) {
                    this.logger.error('邮件发送失败，' + err.message)
                    return reject(err)
                }
                this.logger.info('邮件发送成功')
                resolve(info)
            })
        })
    }
}
