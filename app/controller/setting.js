/**
 * @desc Setting Controller
 */

const { Controller } = require('egg')

module.exports = class SettingController extends Controller {
    async index () {
        const { ctx } = this
        const data = await this.service.setting.index()
        data
            ? ctx.success(data, '数据获取成功')
            : ctx.fail('数据获取失败')
    }

    async update () {
        const { ctx } = this
        const data = await this.service.setting.update(ctx.request.body)
        data
            ? ctx.success(data, '数据更新成功')
            : ctx.fail('数据更新失败')
    }
}
