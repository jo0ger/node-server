/**
 * @desc 用户Controller
 */

const { Controller } = require('egg')

module.exports = class UserController extends Controller {
    async list () {
        const { ctx } = this
        let select = '-password'
        if (!ctx._isAuthed) {
            select += ' -createdAt -updatedAt -role'
        }
        const data = await this.service.user.getList({}, select)
        data
            ? ctx.success(data, '用户列表获取成功')
            : ctx.fail('用户列表获取失败')
    }

    async item () {
        const { ctx } = this
        const { id } = ctx.validateParamsObjectId()
        let select = '-password'
        if (!ctx._isAuthed) {
            select += ' -createdAt -updatedAt -github'
        }
        const data = await this.service.user.getItemById(id, select)
        data
            ? ctx.success(data, '用户详情获取成功')
            : ctx.fail('用户详情获取失败')
    }
}
