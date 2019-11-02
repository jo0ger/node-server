/**
 * @desc 标签 Controller
 */

const { Controller } = require('egg')

module.exports = class SportController extends Controller {
    async test () {
        const { ctx } = this
        // await ctx.service.sport.login()
        await ctx.service.sport.codoon.getRemoteUserInfo()
        const data = await ctx.service.sport.test()
        ctx.success(data, '获取用户信息成功')
    }
}
