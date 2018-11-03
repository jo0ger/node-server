/**
 * @desc api 代理
 */

const axios = require('axios')
const geoip = require('geoip-lite')
const NeteaseMusic = require('simple-netease-cloud-music')
const { Service } = require('egg')

const netease = new NeteaseMusic()

module.exports = class AgentService extends Service {
    get voiceStoreConfig () {
        return {
            key: 'voice',
            // 最大限制500条缓存
            maxLen: 500
        }
    }

    get musicStoreConfig () {
        return {
            key: 'music'
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
            // 随机
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

    async getMusicList () {
        const { key } = this.musicStoreConfig
        let list = await this.app.store.get(key)
        if (!list) {
            list = await this.fetchRemoteMusicList(true)
        }
        return list
    }

    async getMusicSong (songId) {
        const { key } = this.musicStoreConfig
        const list = await this.app.store.get(key)
        let song = null
        if (list) {
            const hit = list.find(item => item.id === songId)
            if (hit && hit.url) {
                song = hit
            }
        }
        return song || await this.fetchRemoteMusicSong(songId, true)
    }

    async fetchRemoteMusicList (cacheIt = true) {
        const playListId = this.app.setting.site.musicId
        if (!playListId) return
        const data = await netease.playlist(playListId)
            .catch(err => {
                this.logger.error('获取歌单列表失败：' + err)
                return null
            })

        if (!data || !data.playlist) return
        const tracks = (data.playlist.tracks || []).map(({ name, id, ar, al, dt, tns }) => {
            return {
                id,
                name,
                duration: dt || 0,
                album: al ? {
                    name: al.name,
                    cover: this.config.isProd ? (this.app.proxyUrl(al.picUrl) || '') : al.picUrl,
                    tns: al.tns
                } : {},
                artists: ar ? ar.map(({ id, name }) => ({ id, name })) : [],
                tns: tns || []
            }
        })
        cacheIt && await this.setMusicListToStore(tracks)
        return tracks
    }

    async fetchRemoteMusicSong (songId, cacheIt = true) {
        if (!songId) return
        songId = +songId
        let song = await netease.url(songId)
            .catch(err => {
                this.logger.error('获取歌曲链接失败：' + err)
                return null
            })
        if (!song || !song.data || !song.data[0]) return
        song = song.data[0]
        if (cacheIt) {
            const cache = await this.setMusicSongToStore(songId, song.url)
            return cache
        }
        return song
    }

    async setMusicListToStore (playlist) {
        if (!playlist || !playlist.length) return
        const { key } = this.musicStoreConfig
        // 一周的缓存时间
        await this.app.store.set(key, playlist, 7 * 24 * 60 * 60 * 1000)
    }

    async setMusicSongToStore (songId, songUrl) {
        if (!songId || !songUrl) return
        const { key } = this.musicStoreConfig
        const list = await this.app.store.get(key)
        if (!list) return
        const hit = list.find(item => item.id === songId)
        if (!hit) return
        hit.url = songUrl
        await this.setMusicListToStore(list)
        return Object.assign(hit)
    }
}
