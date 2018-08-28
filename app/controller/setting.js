/**
 * @desc Setting Controller
 */

const { Controller } = require('egg')

module.exports = class SettingController extends Controller {
    get rules () {
        return {
            index: {
                filter: { type: 'string', required: false }
            },
            create: {
                site: { type: 'object', required: false },
                keys: { type: 'object', required: false }
            },
            update: {
                site: { type: 'object', required: false },
                keys: { type: 'object', required: false }
            }
        }
    }

    async index () {
        const { ctx } = this
        ctx.validate(this.rules.index, ctx.query)
        const data = await this.service.setting.getItem()
        data
            ? ctx.success(data, '配置获取成功')
            : ctx.fail('配置获取失败')
    }

    async update () {
        const { ctx } = this
        let body = ctx.validateBody(this.rules.create)
        const exist = await this.service.setting.getItem()
        if (!exist) {
            return ctx.fail('配置未找到')
        }
        body = this.app.merge(exist, body)
        await this.service.setting.updateItemById(exist._id, body)
        // 抓取友链
        const data = await this.service.setting.updateLinks()
        data
            ? ctx.success(data, '配置更新成功')
            : ctx.fail('配置更新失败')
    }
}
