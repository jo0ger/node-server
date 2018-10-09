/**
 * @desc api 代理
 */

const axios = require('axios')
const geoip = require('geoip-lite')
const { Service } = require('egg')

module.exports = class AgentService extends Service {
    async lookupIp (ip) {
        ip = ip || this.ctx.getCtxIp()
        const res = await axios.get('https://dm-81.data.aliyun.com/rest/160601/ip/getIpInfo.json', {
            headers: {
                Authorization: `APPCODE ${this.app.setting.keys.aliApiGateway.ip.appCode}`
            },
            params: {
                ip
            }
        }).catch(() => null)
        let location = {}
        if (res && res.status === 200 && !res.data.code) {
            location = res.data.data
        } else {
            location = geoip.lookup(ip) || {}
        }
        return {
            ip,
            location
        }
    }

    async voice () {
        const res = await axios.get('https://api.lwl12.com/hitokoto/main/get', {
            params: {
                encode: 'realjson',
                charset: 'utf-8'
            }
        })
        return res.status === 200 ? res.data : null
    }
}
