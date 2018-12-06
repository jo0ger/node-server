/**
 * @desc 数据库，日志备份上传
 */

const fs = require('fs-extra')
const moment = require('moment')
const { Subscription } = require('egg')
const OSS = require('ali-oss')

const BACKUP_ROOT = '/root'
const BACKUP_DIR = '/backup/'
const FILE_NAME = 'backup'
const FILE_EXT = '.tar.gz'
const BACKUP_FILE = BACKUP_ROOT + BACKUP_DIR + FILE_NAME + FILE_EXT

module.exports = class BackupUpload extends Subscription {
    static get schedule () {
        return {
            // 每天2点更新一次
            cron: '0 2 * * * *',
            type: 'worker',
            env: ['prod']
        }
    }

    async subscribe () {
        this.logger.info('开始上传数据备份')
        const yesterday = moment().subtract(1, 'days').format('YYYYMMDD')
        const dir = BACKUP_DIR + FILE_NAME + '-' + yesterday + FILE_EXT
        const BACKUP_UPDATE_FILE = BACKUP_ROOT + dir
        const OSS_FILE = dir
        try {
            await fs.ensureFile(BACKUP_FILE)
            await fs.move(BACKUP_FILE, BACKUP_UPDATE_FILE, { overwrite: true })
            await fs.remove(BACKUP_FILE)
            const ossClient = this.getClient()
            const result = await ossClient.put(OSS_FILE, BACKUP_UPDATE_FILE)
            if (result.res.status === 200) {
                this.logger.info('上传数据备份成功', result.url)
                // 上传成功后清空
                await fs.remove(BACKUP_UPDATE_FILE)
            }
        } catch (error) {
            this.logger.error('上传数据备份失败', error)
            const title = '博客上传数据备份失败'
            this.service.mail.sendToAdmin(title, {
                subject: title,
                html: `<p>错误原因：${error.stack}</p>`
            })
        }
    }

    getClient () {
        try {
            const config = this.app.setting.keys.aliyun
            if (!config) return null
            return new OSS(config)
        } catch (error) {
            this.logger.error(error)
            return null
        }
    }
}
