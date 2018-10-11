/**
 * @desc SEO 相关
 */

const axios = require('axios')
const { Service } = require('egg')

module.exports = class SeoService extends Service {
    get baiduSeoClient () {
        return axios.create({
            baseURL: 'http://data.zz.baidu.com',
            headers: {
                'Content-Type': 'text/plain'
            },
            params: {
                site: this.config.author.url,
                token: this.baiduSeoToken
            }
        })
    }

    get baiduSeoToken () {
        try {
            return this.app.setting.keys.baiduSeo.token
        } catch (e) {
            return ''
        }
    }

    // 百度seo push
    async baiduSeo (type = '', urls = []) {
        if (!this.baiduSeoToken) {
            return this.logger.warn('未找到百度SEO token')
        }
        const actionMap = {
            push: { url: '/urls', title: '推送' },
            update: { url: '/update', title: '更新' },
            delete: { url: '/del', title: '删除' }
        }
        const action = actionMap[type]
        if (!action) return
        const res = await axios.post(
            `http://data.zz.baidu.com${action.url}?site=${this.config.author.url}&token=${this.baiduSeoToken}`,
            urls,
            {
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
        )
        if (res && res.status === 200) {
            this.logger.info(`百度SEO${action.title}成功：${JSON.stringify(res.data)}`)
        } else {
            this.logger.error(`百度SEO${action.title}失败：${res.data && res.data.message}`)
        }
    }
}
