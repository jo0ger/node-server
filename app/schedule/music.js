/**
 * @desc Music 定时任务
 */

const { Subscription } = require('egg')

module.exports = class UpdateMusic extends Subscription {
    static get schedule () {
        return {
            // 每小时更新一次
            interval: '15s',
            type: 'worker',
            immediate: true
        }
    }

    async subscribe () {
        this.logger.info('开始更新Music')
        // 先不缓存到redis中
        let list = await this.service.agent.fetchRemoteMusicList(false)
        list = await Promise.all((list || []).map(async item => {
            const song = await this.service.agent.fetchRemoteMusicSong(item.id, false)
            if (song) {
                return Object.assign({}, item, song)
            }
            return item
        }))
        this.service.agent.setMusicListToStore(list)
        this.logger.info('结束更新Music')
    }
}
