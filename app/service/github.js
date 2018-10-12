/**
 * @desc Github api
 */

const { Service } = require('egg')

module.exports = class GithubService extends Service {
    /**
     * @desc GitHub fetcher
     * @param {String} url url
     * @param {Object} opt 配置
     * @return {Object} 抓取的结果
     */
    async fetch (url, opt) {
        url = 'https://api.github.com' + url
        try {
            const res = await this.app.curl(url, this.app.merge({
                dataType: 'json',
                timeout: 30000,
                headers: {
                    Accept: 'application/json'
                }
            }, opt))
            if (res && res.status === 200) {
                return res.data
            }
        } catch (error) {
            this.logger.error(error)
        }
        return null
    }

    /**
     * @desc 获取GitHub用户信息
     * @param {String} username 用户名（GitHub login）
     * @return {Object} 用户信息
     */
    async getUserInfo (username) {
        if (!username) return null
        let gayhub = {}
        if (this.config.isLocal) {
            // 测试环境下 用测试配置
            gayhub = this.config.github
        } else {
            const { keys } = this.app.setting
            if (!keys || !keys.github) {
                this.logger.warn('未找到GitHub配置')
                return null
            }
            gayhub = keys.github
        }
        const { clientID, clientSecret } = gayhub
        const data = await this.fetch(`/users/${username}?client_id=${clientID}&client_secret=${clientSecret}`)
        if (data) {
            this.logger.info(`GitHub用户信息抓取成功：${username}`)
        } else {
            this.logger.warn(`GitHub用户信息抓取失败：${username}`)
        }
        return data
    }

    /**
     * @desc 批量获取GitHub用户信息
     * @param {Array} usernames username array
     * @return {Array} 返回数据
     */
    async getUsersInfo (usernames = []) {
        if (!Array.isArray(usernames) || !usernames.length) return []
        return await Promise.all(usernames.map(name => this.getUserInfo(name)))
    }

    async getAuthUserInfo (access_token) {
        const data = await this.fetch(`/user?access_token=${access_token}`)
        if (data) {
            this.logger.warn('Github用户信息抓取成功')
        } else {
            this.logger.warn('Github用户信息抓取失败')
        }
        return data
    }
}
