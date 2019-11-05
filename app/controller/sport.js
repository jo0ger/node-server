/**
 * @desc 标签 Controller
 */

const { Controller } = require('egg')

module.exports = class SportController extends Controller {
    async test () {
        const { ctx } = this
        await ctx.service.sport.codoon.login()
        // await ctx.service.sport.codoon.getRemoteUserInfo()
        const data = await ctx.service.sport.codoon.getRemoteRecordsByAutoId(ctx.query.autoId)
        ctx.success(data, '获取用户信息成功')
    }

    async testAll () {
        const { ctx } = this
        await ctx.service.sport.codoon.login()
        const data = await ctx.service.sport.codoon.getRemoteAllRecords({
            endRouteId: 'e5b1a391-ff11-11e9-8e01-016e35acf248',
            sort: 'desc'
        })
        ctx.success(data, '获取用户信息成功')
    }
}
