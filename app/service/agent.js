/**
 * @desc api 代理
 */

const axios = require('axios')
const geoip = require('geoip-lite')
const { Service } = require('egg')

module.exports = class AgentService extends Service {
    get voiceStoreConfig () {
        return {
            key: 'voice',
            // 最大限制500条缓存
            maxLen: 500
        }
    }

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

    async getVoice () {
        const { key } = this.voiceStoreConfig
        const voiceStore = await this.app.store.get(key)
        let data = null
        if (voiceStore && voiceStore.length) {
            data = voiceStore[Math.floor(Math.random() * voiceStore.length)]
        } else {
            data = await this.fetchRemoteVoice()
        }
        return data
    }

    async fetchRemoteVoice () {
        const res = await axios.get('https://api.lwl12.com/hitokoto/main/get', {
            params: {
                encode: 'realjson',
                charset: 'utf-8'
            }
        }).catch(err => {
            this.logger.error('获取Voice失败：' + err)
            return null
        })
        if (res && res.status === 200) {
            await this.setVoiceToStore(res.data)
            return res.data
        }
        return null
    }

    async setVoiceToStore (voice) {
        if (!voice) return
        const { key, maxLen } = this.voiceStoreConfig
        let voiceStore = await this.app.store.get(key)
        if (!voiceStore) {
            // 初始化
            voiceStore = []
        }
        if (voiceStore.length >= maxLen) {
            voiceStore.shift()
        }
        voiceStore.push(voice)
        await this.app.store.set(key, voiceStore)
    }
}
