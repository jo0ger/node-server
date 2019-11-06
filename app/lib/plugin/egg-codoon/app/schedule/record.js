/**
 * @desc 咕咚运动记录抓取定时任务
 */

const { Subscription } = require('egg')

// const codoonTmpRecordsKey = Symbol('codoon_tmp_records')

module.exports = class getCodoonRecords extends Subscription {
    static get schedule () {
        return {
            cron: '0 1 * * * *',
            type: 'worker',
            immediate: true
        }
    }

    get maxRetry () {
        return 10
    }

    getLatestRecord () {
        return this.ctx.service.sport.getItem({}, {}, { sort: { createdAt: -1 } })
    }

    async subscribe () {
        this.logger.info('开始执行咕咚运动记录数据任务')
        try {
            await this.app.codoon.login()
            await this.app.codoon.getRemoteUserInfo()
            const latest = await this.getLatestRecord()
            const endRouteId = latest ? latest.routeId : null
            const recentRecords = await this.app.codoon.getRemoteAllRecords({ endRouteId })
            // const backup = recentRecords.slice()
            while (recentRecords.length) {
                const cur = recentRecords.shift()
                const record = await this.app.codoon.getRemoteRecordDetailByRouteId(cur.routeId)
                const model = this.ctx.service.sport.mapCodoonDataToModel(record)
                await this.ctx.service.sport.create(model)
                this.logger.info('咕咚运动记录数据存储成功，routeId：' + cur.routeId)
            }
        } catch (err) {
            // TODO retry?
            // this.app.store.set(codoonTmpRecordsKey, )
            this.logger.error('抓取咕咚运动记录数据出错，err：' + err)
        }
        this.logger.info('结束执行抓取咕咚运动记录数据任务')
    }
}
