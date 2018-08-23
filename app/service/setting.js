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
                    required: true
                },
                keys: {
                    type: 'object',
                    required: true
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
        if (!ctx._isAuthenticated) {
            query.select = 'site'
        }
        return await this.findOne(query).exec()
    }

    async keys () {
        return await this.findOne().select('keys').exec()
    }

    async create (payload) {
        const { ctx } = this
        const body = payload || ctx.request.body
        ctx.validate(this.rules.create, body)
        const exist = await this.findOne().exec()
        if (exist) {
            ctx.throw(200, '分类已经存在')
        }
        return await this.newAndSave(body)
    }

    async update (payload) {
        if (!payload) {
            // http request
            payload = await this.findOne().exec()
            if (!payload) return
        }
        // 更新友链
        payload.site.links = await this.service.util.generateLinks(payload.site.links)
        const data = await this.updateOne({}, payload).exec()
        if (data) {
            this.logger.info('Setting更新成功')
        }
        return data
    }
}
