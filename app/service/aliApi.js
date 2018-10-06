/**
 * @desc 阿里Api市场服务 Services
 */

const https = require('https')
const { Service } = require('egg')

module.exports = class AliApiService extends Service {
    lookupIp (ip) {
        return new Promise(resolve => {
            const req = https.request({
                hostname: 'dm-81.data.aliyun.com',
                port: 443,
                path: `/rest/160601/ip/getIpInfo.json?ip=${ip}`,
                method: 'GET',
                protocol: 'https:',
                headers: {
                    Authorization: `APPCODE ${this.app.setting.keys.aliApiGateway.ip.appCode}`
                }
            }, res => {
                let success = false
                let data = null
                if (res.statusCode === 200) {
                    success = true
                }
                res.on('data', d => {
                    data = JSON.parse(d)
                })
                res.on('end', () => {
                    if (success && data && !data.code) {
                        this.app.logger.info('IP地址查询成功，ip：' + ip)
                        return resolve({
                            success: true,
                            data: data.data
                        })
                    }
                    resolve({
                        success: false,
                        data
                    })
                })
            })
            req.on('error', err => {
                this.app.logger.error(err)
                resolve({
                    success: false,
                    data: err
                })
            })
            req.end()
        })
    }
}
