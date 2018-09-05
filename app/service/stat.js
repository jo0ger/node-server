/**
 * @desc 各类统计 Service
 */

const moment = require('moment')
const ProxyService = require('./proxy')

module.exports = class StatService extends ProxyService {
    get model () {
        return this.app.model.Stat
    }

    get statConfig () {
        return this.app.config.modelEnum.stat.type.optional
    }

    get dimensions () {
        return {
            day: {
                type: 'day',
                format: '%Y-%m-%d',
                mFormat: 'YYYY-MM-DD'
            },
            month: {
                type: 'month',
                format: '%Y-%m',
                mFormat: 'YYYY-MM'
            },
            year: {
                type: 'year',
                format: '%Y',
                mFormat: 'YYYY'
            }
        }
    }

    get dimensionsValidate () {
        return Object.values(this.dimensions).map(item => item.type)
    }

    async record (typeKey, target = {}, statKey) {
        const type = this.statConfig[typeKey]
        const stat = { [statKey]: 1 }
        const payload = { type, target, stat }
        const data = await this.create(payload)
        if (data) {
            this.logger.info(`统计项生成成功，[id: ${data._id}] [type：${typeKey}] [stat：${statKey}]`)
        }
    }

    async getCount (type) {
        const [today, total] = await Promise.all([
            this.countToday(type),
            this.countTotal(type)
        ])
        return { today, total }
    }

    countToday (type) {
        return this.countFromToday(0, type)
    }

    countTotal (type) {
        return this.countFromToday(null, type)
    }

    countFromToday (subtract, type) {
        const today = new Date()
        const before = (subtract !== null) ? moment().subtract(subtract, 'days') : subtract
        return this.countRange(before, today, type)
    }

    async countRange (start, end, type) {
        let sm = start && moment(start)
        let em = end && moment(end)
        let service = null
        const filter = {
            createdAt: {}
        }
        if (sm) {
            const format = sm.format('YYYY-MM-DD 00:00:00')
            sm = moment(format)
            filter.createdAt.$gte = new Date(format)
        }
        if (em) {
            const format = em.format('YYYY-MM-DD 23:59:59')
            em = moment(format)
            filter.createdAt.$lte = new Date(em.format('YYYY-MM-DD 23:59:59'))
        }
        if (type === 'pv') {
            service = this
            filter.type = this.statConfig.ARTICLE_VIEW
        } else if (type === 'like') {
            service = this
            filter.type = this.statConfig.ARTICLE_LIKE
        } else if (type === 'comment') {
            // 文章评论量
            service = this.service.comment
            filter.type = this.config.modelEnum.comment.type.optional.COMMENT
        } else if (type === 'message') {
            // 站内留言量
            service = this.service.comment
            filter.type = this.config.modelEnum.comment.type.optional.MESSAGE
        }
        return service && service.count(filter) || null
    }

    async trendRange (start, end, dimension, type) {
        let sm = moment(start)
        let em = moment(end)
        let service = null
        const $sort = {
            createdAt: -1
        }
        const $match = {
            createdAt: {}
        }
        if (sm) {
            const format = sm.format('YYYY-MM-DD 00:00:00')
            sm = moment(format)
            $match.createdAt.$gte = new Date(format)
        }
        if (em) {
            const format = em.format('YYYY-MM-DD 23:59:59')
            em = moment(format)
            $match.createdAt.$lte = new Date(em.format('YYYY-MM-DD 23:59:59'))
        }
        const $project = {
            _id: 0,
            createdAt: 1,
            date: {
                $dateToString: {
                    format: this.dimensions[dimension].format,
                    date: '$createdAt'
                }
            }
        }
        const $group = {
            _id: '$date',
            count: {
                $sum: 1
            }
        }
        if (type === 'pv') {
            service = this
            $match.type = this.statConfig.ARTICLE_VIEW
        } else if (type === 'like') {
            service = this
            $match.type = this.statConfig.ARTICLE_LIKE
        } else if (type === 'comment') {
            // 文章评论量
            service = this.service.comment
            $match.type = this.config.modelEnum.comment.type.optional.COMMENT
        } else if (type === 'message') {
            // 站内留言量
            service = this.service.comment
            $match.type = this.config.modelEnum.comment.type.optional.MESSAGE
        }
        if (!service) return []
        const data = await service.aggregate([
            { $sort },
            { $match },
            { $project },
            { $group }
        ])
        // day维度
        let radix = 1000 * 60 * 60 * 24
        if (dimension === this.dimensions.month.type) {
            // month 维度
            radix *= 30
        } else if (dimension === this.dimensions.year.type) {
            // year 维度
            radix *= 365
        }
        const diff = Math.ceil(em.diff(sm) / radix)
        return new Array(diff || 1).fill().map((item, index) => {
            const date = moment(sm).add(index, dimension + 's').format(this.dimensions[dimension].mFormat)
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
