/**
 * @desc 用户Controller
 */

const { Controller } = require('egg')
 
module.exports = class UserController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.user.list()
        data
            ? ctx.success(data, '用户列表获取成功')
            : ctx.fail('用户列表获取失败')
    }

    async item () {
        const { ctx } = this
        const data = await this.service.user.item()
        data
            ? ctx.success(data, '用户详情获取成功')
            : ctx.fail('用户详情获取失败')
    }
}
