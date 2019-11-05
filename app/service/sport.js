/**
 * @desc 咕咚 运动记录 相关
 */

const axios = require('axios')
const ProxyService = require('./proxy')
const cheerio = require('cheerio')
const setCookie = require('set-cookie-parser')

const codoonSessionidKey = Symbol('codoon_sessionid')
const codoonUserKey = Symbol('codoon_user')
const maxAge = 7 * 24 * 60 * 60 * 1000
let client = null

module.exports = class SportService extends ProxyService {
    constructor (ctx) {
        super(ctx)
        this.codoon = new Codoon(ctx)
    }

    get model () {
        return this.app.model.Sport
    }

    mapDataToModel (data) {
        const model = {}
        if (!data) return model
        model.createdAt = data.start_time
        model.updatedAt = data.end_time
        model.autoId = data.auto_id
        model.routeId = data.route_id
        model.location = data.location
        model.type = data.sports_type
        model.index = data.index
        model.uploadedAt = data.upload_time
        model.distance = data.total_length
        model.time = {
            total: data.total_time,
            totalText: data.time_format
        }
        model.elevation = {
            total: data.total_elevation,
            max: data.max_elevation
        }
        model.position = {
            start: {
                lng: data.start_point[0],
                lat: data.start_point[1]
            },
            end: {
                lng: data.end_point[0],
                lat: data.end_point[1]
            },
            offset: {
                lng: data.offsets[0],
                lat: data.offsets[1]
            }
        }
        model.speed = {
            max: data.max_speed,
            avg: data.avg_speed,
            maxPace: data.highest_speed_perkm
        }
        model.perkm = (data.usettime_per_km || []).map(p => {
            return {
                location: {
                    lng: p.atLocation.longitude,
                    lat: p.atLocation.latitude
                },
                paces: p.avg_paces,
                speed: p.avg_speed,
                duration: p.useTime,
                durationText: p.cost_time,
                distance: p.distance,
                totalUseTime: p.totalUseTime,
                totalUseTimeText: p.total_time
            }
        })
        const { route_line, speed_list } = data
        model.points = (data.points || []).map((p, i) => {
            const [lng, lat] = route_line[i] || [0, 0]
            return {
                distance: p.distance,
                elevation: p.elevation,
                speed: speed_list[i] || 0,
                location: { lng, lat },
                hAccuracy: p.hAccuracy,
                vAccuracy: p.vAccuracy,
                timestamp: p.time_stamp,
                topreviouscostTime: p.topreviouscostTime,
                topreviousenergy: p.topreviousenergy,
                topreviousspeed: p.topreviousspeed,
                tostartcostTime: p.tostartcostTime,
                tostartdistance: p.tostartdistance,
                type: p.type
            }
        })
        model.steps = data.total_steps
        model.calories = data.total_calories
        model.fraud = data.is_fraud
        model.user = {
            nick: data.user.nick,
            avatar: data.user.icon_small
        }
        return model
    }

    async fetchRemoteList () {
        // TODO
    }

    async storeRecord (record) {
        const model = this.mapDataToModel(record)
        const data = await this.service.sport.create(model)
        return data
    }

    async test () {
        const record = await this.codoon.getRemoteRecordDetail('e5462fab-fb1e-11e9-8940-016e01d64168')
        return await this.storeRecord(record)
    }
}

class Codoon {
    constructor (scope) {
        this.scope = scope
        this.logger = scope.logger
        this.app = scope.app
    }

    get client () {
        if (!client) {
            client = axios.create({
                baseURL: 'http://www.codoon.com',
                headers: {
                    Accept: 'application/json; charset=utf-8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
                },
                'X-Requested-With': 'XMLHttpRequest'
            })
            client.interceptors.request.use(async config => {
                if (!config.headers.Cookie) {
                    config.headers.Cookie = ''
                }
                const sessionid = await this.getSessionId()
                config.headers.Cookie += `sessionid=${sessionid};`
                return config
            }, Promise.reject)
        }
        return client
    }

    getSessionId () {
        return this.scope.app.store.get(codoonSessionidKey)
    }

    getUserInfo () {
        return this.scope.app.store.get(codoonUserKey)
    }

    login () {
        return this.client.post('http://sso.codoon.com/login', Object.assign({
            forever: 'on',
            app_id: 'www',
            next: '/'
        }, this.codoonParams), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            maxRedirects: 0
        }).then(() => {
            this.logger.info('咕咚登录成功')
        }).catch(err => {
            const cookies = setCookie.parse(err.response)
            const sessionIdCookie = cookies.find(c => c.name === 'sessionid')
            const sessionid = sessionIdCookie.value
            this.logger.info('咕咚登录成功，sessionid=' + sessionid)
            return this.app.store.set(codoonSessionidKey, sessionid, maxAge)
        })
    }

    async getRemoteUserInfo () {
        const res = await this.client.get('/ugcserver/index')
        const user = res.data.data
        await this.app.store.set(codoonUserKey, user, maxAge)
        return user
    }

    /**
     * @return {Object} 运动总量
     *  - distance 运动距离 单位：km
     *  - duration 运动时间 单位：天
     *  - calorie  消耗热量 单位：大卡
     *  - equal {Object} 等价于
     *      - runway 环形跑道 单位：圈
     *      - fat    脂肪 单位：公斤
     *      - gasoline #93汽油 单位：升
     *      - bulb 60W电灯泡 单位：小时
     */
    async getRemoteTotalData () {
        const res = await this.client.get('/data_v', {
            headers: {
                Accept: 'text/html,application/xhtml+xml'
            }
        })
        const $ = cheerio.load(res.data)
        const result = {
            distance: $('.my_d_T .Tydjl_i + div span').text(),
            duration: $('.my_d_T .TydT_i + div span').text(),
            calorie: $('.my_d_T .Tydk_i + div span').text(),
            equal: {
                runway: $('.REW .REWR > div:last-child').text(),
                fat: $('.REW .REWM > div:last-child').text(),
                gasoline: $('.REW .REWG > div:last-child').text(),
                bulb: $('.REW .REWL > div:last-child').text()
            }
        }
        return result
    }

    async getRemoteRecords () {
        const res = await this.client.get('/gps_sports/routes_feed', {
            headers: {
                Accept: 'text/html,application/xhtml+xml'
            }
        })
        return res.data
    }

    async getRemoteRecordDetail (route_id = '') {
        const { id: user_id } = await this.getUserInfo()
        let res = null
        try {
            res = await this.client.get('/gps_sports/route', {
                params: {
                    user_id,
                    route_id,
                    need_next: 1
                }
            })
        } catch (e) {
            // TODO log it，除了 跑步，健走，骑行外的运动会报错
        }
        return res && res.data || null
    }

    async getRemoteAdjacentRecordDetail () {
        // TODO
    }

    async getRemoteStat (range = 7) {
        const res = await this.client.get('/gps_sports/my_routes/statistic', {
            headers: {
                Accept: 'text/html,application/xhtml+xml'
            },
            params: {
                range_name: range
            }
        })
        return res.data
    }
}
