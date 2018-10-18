/**
 * @desc 个人信息更新定时任务
 */

const { Subscription } = require('egg')

module.exports = class UpdatePersonalGithubInfo extends Subscription {
    static get schedule () {
        return {
            // 每小时更新一次
            interval: '1h',
            type: 'worker'
        }
    }

    async subscribe () {
        this.logger.info('开始更新个人Github信息')
        await this.service.setting.updateGithubInfo()
        this.logger.info('结束更新个人Github信息')
    }
}
