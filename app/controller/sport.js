/**
 * @desc 标签 Controller
 */

const { Controller } = require('egg')

module.exports = class SportController extends Controller {
    async test () {
        const { ctx, app } = this
        await app.codoon.getRemoteUserInfo()
        const data = await app.codoon.getRemoteRecordDetailByRouteId(ctx.query.routeId)
        // const data = await app.codoon.getRemoteRecentStatData()
        ctx.success(data, '获取用户信息成功')
    }

    async testAll () {
        const { ctx, app } = this
        const data = await app.codoon.getRemoteAllRecords({
            endRouteId: 'e5b1a391-ff11-11e9-8e01-016e35acf248',
            sort: 'desc'
        })
        await ctx.service.sport.storeRecords(data)
        ctx.success(data, '获取用户信息成功')
    }
}
