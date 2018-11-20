/**
 * @desc 获取Voice定时任务
 */

const { Subscription } = require('egg')

module.exports = class GetVoice extends Subscription {
    static get schedule () {
        return {
            // 每5分钟更新一次
            interval: '5m',
            type: 'worker'
        }
    }

    async subscribe () {
        this.logger.info('开始请求远端Voice')
        await this.service.agent.fetchRemoteVoice()
        this.logger.info('结束请求远端Voice')
    }
}
