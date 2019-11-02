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
        const res = await axios.get('https://v1.hitokoto.cn', {
            params: {
                encode: 'json',
                charset: 'utf-8'
            }
        }).catch(err => {
            this.logger.error('获取Voice失败：' + err)
            return null
        })
        if (res && res.status === 200) {
            const { hitokoto, from, creator } = res.data
            const data = {
                text: hitokoto,
                source: from,
                author: creator
            }
            await this.setVoiceToStore(data)
            return data
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
            list = await this.fetchRemoteMusicList()
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
        return song || await this.fetchRemoteMusicSong(songId)
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

        const app = this.app

        // 获取歌曲链接
        async function fetchUrl () {
            let song = await netease.url(songId)
                .catch(err => {
                    this.logger.error('获取歌曲链接失败：' + err)
                    return null
                })
            if (!song || !song.data || !song.data[0]) return null
            song = song.data[0]
            song.url = app.proxyUrl(song.url)
            return song
        }

        // 获取歌词
        async function fetchLyric () {
            const res = {}
            const { lrc, tlyric } = await netease.lyric(songId)
                .catch(err => {
                    this.logger.error('获取歌曲歌词失败：' + err)
                    return {
                        lrc: null,
                        tlyric: null
                    }
                })
            res.lyric = lrc && lrc.lyric || null
            res.tlyric = tlyric && tlyric.lyric || null
            return res
        }
        const song = await fetchUrl()
        const { lyric, tlyric } = await fetchLyric()
        if (song) {
            Object.assign(song, {
                lyric: parseLyric(lyric, tlyric)
            })
            if (cacheIt) {
                return await this.setMusicSongToStore(songId, song)
            }
        }
        return song
    }

    async setMusicListToStore (playlist) {
        if (!playlist || !playlist.length) return
        const { key } = this.musicStoreConfig
        // 1小时的缓存时间
        await this.app.store.set(key, playlist, 60 * 60 * 1000)
    }

    async setMusicSongToStore (songId, song) {
        if (!songId || !song) return
        const { key } = this.musicStoreConfig
        const list = await this.app.store.get(key)
        if (!list) return
        const hit = list.find(item => item.id === songId)
        if (!hit) return
        Object.assign(hit, song)
        await this.setMusicListToStore(list)
        return Object.assign(hit)
    }
}

// 歌词时间正则 => 01:59.999
const lrcTimeReg = /\[(([0-5][0-9]):([0-5][0-9])\.(\d+))\]/g
/**
 * 解析歌词
 * @param {String} lrc 原版歌词
 * @param {String} tlrc 翻译歌词
 * @return {Array<Array>} 解析后的歌词
 */
function parseLyric (lrc, tlrc) {
    if (!lrc) return []
    function parse (text) {
        if (!text) text = ''
        return text.split('\n').reduce((prev, line) => {
            const match = lrcTimeReg.exec(line)
            if (match) {
                const time = parseTime(match[1])
                prev[time] = line.replace(lrcTimeReg, '') || '~~~'
            }
            return prev
        }, {})
    }

    const lrcParsed = parse(lrc)
    const tlrcParsed = parse(tlrc)

    return Object.keys(lrcParsed)
        .map(time => parseFloat(time))
        .sort((a, b) => a - b)
        .reduce((prev, time) => {
            prev.push({
                time,
                lrc: lrcParsed[time],
                tlrc: tlrcParsed[time] || ''
            })
            return prev
        }, [])
}

function parseTime (time) {
    time = time.split(':')
    if (time.length !== 2) {
        return 0
    }
    const minutes = parseInt(time[0])
    const seconds = parseFloat(time[1])
    return minutes * 60 + seconds
}
