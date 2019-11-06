const axios = require('axios')
const cheerio = require('cheerio')
const setCookie = require('set-cookie-parser')
const { orderBy } = require('natural-orderby')

const codoonCacheKey = Symbol('codoon')
// 7天有效时间
const maxAge = 7 * 24 * 60 * 60 * 1000

module.exports = app => {
    app.addSingleton('codoon', createCodoonClient)
}

function createCodoonClient (config, app) {
    app.logger.info('[egg-codoon] 服务启动成功')
    return new Codoon(app)
}

class Codoon {
    constructor (app) {
        this.app = app
        this.initHttp()
        this.getSessionId()
            .then(sessionId => {
                if (!sessionId) {
                    this.login()
                }
            })
    }

    get supportSportTypes () {
        // 0 健走 | 1 跑步 | 2 骑行 | -1 其他，待定
        return ['walk', 'run', 'bike']
    }

    get config () {
        try {
            const { phone: login_id, pass: password } = this.app.setting.keys.codoon || {}
            return { login_id, password }
        } catch (e) {
            // pass
        }
    }

    initHttp () {
        if (!this.http) {
            this.http = axios.create({
                baseURL: 'http://www.codoon.com',
                timeout: 30000,
                headers: {
                    Accept: 'application/json; charset=utf-8',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
                },
                'X-Requested-With': 'XMLHttpRequest'
            })
            this.http.interceptors.request.use(async config => {
                if (!config.headers.Cookie) {
                    config.headers.Cookie = ''
                }
                const sessionid = await this.getSessionId()
                config.headers.Cookie += `sessionid=${sessionid};`
                return config
            }, Promise.reject)
        }
    }

    log (...args) {
        args.unshift('[egg-codoon]')
        this.app.logger.info(...args)
    }


    getCache () {
        return this.app.store.get(codoonCacheKey)
    }

    async getSessionId () {
        const cache = await this.getCache()
        return cache.sessionId
    }

    async getUserInfo () {
        const cache = await this.getCache()
        return cache.user
    }

    async cache (patch = {}) {
        const cache = await this.getCache()
        const args = [codoonCacheKey, Object.assign({}, cache, patch)]
        if (!cache) args.push(maxAge)
        await this.app.store.set(...args)
    }

    login () {
        return this.http.post('http://sso.codoon.com/login', Object.assign({
            forever: 'on',
            app_id: 'www',
            next: '/'
        }, this.codoonParams), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            // 禁止 302，不然拿不到 cookie
            maxRedirects: 0
        }).then(() => {
            this.log('咕咚登录成功')
        }).catch(err => {
            const cookies = setCookie.parse(err.response)
            const sessionIdCookie = cookies.find(c => c.name === 'sessionid')
            const sessionId = sessionIdCookie.value
            this.log('咕咚登录成功，sessionid=' + sessionId)
            return this.cache({ sessionId })
        })
    }

    async getRemoteUserInfo () {
        const res = await this.http.get('/ugcserver/index')
        const user = res.data.data
        await this.cache({ user })
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
        const res = await this.http.get('/data_v', {
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

    async getRemoteRecentStatData (range = 7) {
        const res = await this.http.get('/gps_sports/my_routes/statistic', {
            headers: {
                Accept: 'text/html,application/xhtml+xml'
            },
            params: {
                range_name: range
            }
        })

        const result = {
            range,
            count: {
                total: 0,
                walk: 0,
                run: 0,
                ride: 0
            },
            distance: {
                total: 0,
                trend: []
            },
            duration: {
                total: '',
                trend: []
            },
            calorie: {
                total: 0,
                trend: []
            }
        }

        const $ = cheerio.load(res.data)
        const root = $('.routes_statistic')

        const getTotalData = () => {
            result.count.total = Number(root.find('#select_type_count').text())
            result.count.walk = Number(root.find('.pie_step + div span').text())
            result.count.run = Number(root.find('.pie_run + div span').text())
            result.count.ride = Number(root.find('.pie_bike + div span').text())
            const stat = root.find('.sta_title span:first-child')
            result.distance.total = Number(stat.eq(0).text())
            result.duration.total = stat.eq(1).text()
            result.calorie.total = Number(stat.eq(2).text())
        }

        const getTrend = () => {
            let scriptText = $('script').filter((_i, elem) => $(elem).html().includes('length_records'))
                .eq(0)
                .html()
            scriptText = 'var window = { onload: function () {}}\n' + scriptText
            scriptText = scriptText.replace('routes_statistic', 'return ')
            scriptText += '\nreturn window.onload()'
            // eslint-disable-next-line no-new-func
            const trendData = new Function(scriptText)()
            if (trendData) {
                result.distance.trend = trendData.length_records
                result.duration.trend = trendData.time_records
                result.calorie.trend = trendData.calory_records
            }
        }

        getTotalData()
        getTrend()

        return result
    }

    async getRemoteAllRecords (options = {}) {
        const {
            endRouteId = null, // 待抓取的结束路线 ID
            interval = 1000, // 抓取间隔
            sort = 'asc', // 按日期排序 false desc asc
            deWeighting = true, // 去重
            debug = false // debug？
        } = options
        const finish = data => {
            this.log('暂无更多运动记录')
            return data
        }

        const getRecords = async (autoId = '') => {
            const { autoId: nextAutoId, hasNext, records } = await this.getRemoteRecordsByAutoId(autoId)
            if (!hasNext) {
                return finish(records)
            }
            if (endRouteId) {
                const hit = records.findIndex(({ routeId }) => routeId === String(endRouteId))
                if (hit > -1) {
                    // 命中
                    return finish(records.slice(0, hit))
                }
            }
            if (interval > 0) {
                await new Promise(r => setTimeout(r, interval))
            }
            return records.concat(await getRecords(nextAutoId))
        }

        let records = await getRecords()

        if (deWeighting) {
            const set = new Set()
            records = records.filter(item => {
                if (set.has(item.routeId)) return false
                return set.add(item.routeId)
            })
        }

        if (sort) {
            records = orderBy(
                records,
                v => v.date,
                sort
            )
        }

        if (debug) {
            const fs = require('fs-extra')
            const path = require('path')
            fs.outputJsonSync(path.resolve(__dirname, '../../tmp/sports.json'), records)
        }
        return records
    }

    async getRemoteRecordsByAutoId (prevAutoId = '') {
        const res = await this.http.get('/gps_sports/routes_feed', {
            headers: {
                Accept: 'text/html,application/xhtml+xml'
            },
            params: {
                auto_id: prevAutoId,
                _: Date.now()
            }
        })
        const $ = cheerio.load(res.data)

        // 获取本列数据的 autoId
        const getAutoId = () => {
            let autoIdScript = $('script:first-child').html()
            autoIdScript = 'var jQ = function () {return {hide: function () {}}}\n' + autoIdScript
            autoIdScript += '\nreturn auto_id;'
            // eslint-disable-next-line no-new-func
            return (new Function(autoIdScript))()
        }

        const getSportType = icon => this.supportSportTypes.findIndex(type => icon.includes(type))

        const getRecords = () => {
            const ctx = $('table')
            return ctx
                .map(function () {
                    const item = $(this)
                    const icon = item.find('td:nth-child(1) img').attr('src')
                    const type = getSportType(icon)
                    return {
                        date: item.closest('dl.detail_sports_date_list').attr('class').slice(-10),
                        routeId: item.attr('route_id'),
                        type,
                        icon,
                        distance: item.find('td:nth-child(2) span:nth-child(3)').text(),
                        duration: item.find('td:nth-child(3) span:nth-child(3)').text(),
                        avgSpeed: item.find('td:nth-child(4) span:nth-child(3)').text(),
                        calorie: item.find('td:nth-child(5) span:nth-child(3)').text()
                    }
                })
                .get()
        }

        const autoId = getAutoId()
        const records = getRecords()

        this.log(`运动记录抓取成功，prevAutoId: ${prevAutoId || null}, autoId: ${autoId}`)

        return {
            prevAutoId,
            autoId,
            records,
            hasNext: records.length >= 3 // 咕咚每次 autoId 返回的数据最多 3 条
        }
    }

    async getRemoteRecordDetailByRouteId (route_id = '') {
        const { id: user_id } = await this.getUserInfo()
        let res = null
        try {
            res = await this.http.get('/gps_sports/route', {
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
        const res = await this.http.get('/gps_sports/my_routes/statistic', {
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
