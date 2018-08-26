/**
 * @desc Setting Services
 */

const ProxyService = require('./proxy')

module.exports = class SettingService extends ProxyService {
    get model () {
        return this.app.model.Setting
    }

    get rules () {
        return {
            index: {
                filter: { type: 'string', required: false }
            },
            create: {
                site: {
                    type: 'object',
                    required: false
                },
                keys: {
                    type: 'object',
                    required: false
                }
            },
            update: {
                site: {
                    type: 'object',
                    required: false
                },
                keys: {
                    type: 'object',
                    required: false
                }
            }
        }
    }

    async index () {
        const { ctx } = this
        ctx.validate(this.rules.index, ctx.query)
        const query = {}
        const { filter } = ctx.query
        if (filter) {
            query.select = filter.split(',').join(' ')
        }
        if (!ctx._isAuthed) {
            query.select = 'site'
        }
        return await this.findOne(query).exec()
    }

    async keys () {
        const data = await this.findOne().select('keys').exec()
        return data && data.keys || {}
    }

    async create () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.create, payload)
        const exist = await this.findOne().exec()
        if (exist) {
            ctx.throw(200, '分类已经存在')
        }
        return await this.newAndSave(body)
    }

    async seed () {
        const exist = await this.findOne().exec()
        if (exist) {
            return exist
        }
        const data = await this.newAndSave()
        if (data && data.length) {
            this.logger.info('Setting初始化成功')
        } else {
            this.logger.info('Setting初始化失败')
        }
        return data
    }

    async update (payload) {
        if (!payload) {
            // http request
            payload = await this.findOne().exec()
            if (!payload) return
        }
        payload.site = payload.site || {}
        // 更新友链
        payload.site.links = await this.service.common.generateLinks(payload.site.links)
        const data = await this.updateOne({}, payload).exec()
        if (data) {
            this.logger.info('Setting更新成功')
        }
        return data
    }
}
