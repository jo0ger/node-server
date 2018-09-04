/**
 * @desc 友链更新定时任务
 */

const { Subscription } = require('egg')

module.exports = class Links extends Subscription {
    static get schedule () {
        return {
            // 每天0点更新一次
            cron: '0 0 * * *',
            type: 'all'
        }
    }

    async task () {
        await this.service.setting.updateLinks()
    }
}
