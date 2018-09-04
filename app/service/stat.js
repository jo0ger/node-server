/**
 * @desc 各类统计 Service
 */

const moment = require('moment')
const ProxyService = require('./proxy')

module.exports = class StatService extends ProxyService {
    get model () {
        return this.app.model.Stat
    }

    async record (typeKey, target = {}, statKey) {
        const statConfig = this.app.config.modelEnum.stat.type.optional
        const type = statConfig[typeKey]
        const stat = { [statKey]: 1 }
        const payload = { type, target, stat }
        const data = await this.create(payload)
        if (data) {
            this.logger.info(`统计项生成成功，[id: ${data._id}] [type：${typeKey}] [stat：${statKey}]`)
        }
    }

    async count () {
        return this.countFromToday(10, 'ARTICLE_LIKE')
    }

    countToday (type) {
        return this.countFromToday(0, type)
    }

    countWeek (type) {
        return this.countFromToday(7, type)
    }

    countFromToday (subtract, type) {
        const today = new Date()
        const before = moment().subtract(subtract, 'days')
        return this.countRange(before, today, type)
    }

    async countRange (start, end, type) {
        const statConfig = this.app.config.modelEnum.stat.type.optional
        const sm = moment(start)
        const em = moment(end)
        const $sort = {
            createdAt: 1
        }
        const $match = {
            type: statConfig[type],
            createdAt: {
                $gte: new Date(sm.format('YYYY-MM-DD 00:00:00')),
                $lte: new Date(em.format('YYYY-MM-DD 23:59:59'))
            }
        }
        const $project = {
            _id: 0,
            'stat.count': 1,
            createdAt: 1,
            date: {
                $dateToString: {
                    format: '%Y-%m-%d',
                    date: '$createdAt'
                }
            }
        }
        const $group = {
            _id: '$date',
            count: {
                $sum: '$stat.count'
            },
        }
        const data = await this.aggregate([
            { $sort },
            { $match },
            { $project },
            { $group }
        ])
        const diff = Math.ceil(em.diff(sm) / 60 / 60 / 24 / 1000)
        return new Array(diff || 1).fill().map((item, index) => {
            const date = moment().subtract(index, 'days').format('YYYY-MM-DD')
            let count = 0
            const hit = data.find(d => d._id === date)
            if (hit) {
                count = hit.count
            }
            return {
                date,
                count
            }
        })
    }
}
