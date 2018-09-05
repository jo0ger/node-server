/**
 * @desc 个人信息更新定时任务
 */

const { Subscription } = require('egg')

module.exports = class Links extends Subscription {
    static get schedule () {
        return {
            // 每小时更新一次
            cron: '0 0 */1 * * *',
            type: 'all'
        }
    }

    async task () {
        await this.service.setting.updateGithubInfo()
    }
}
