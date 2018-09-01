/**
 * @desc 用户Controller
 */

const { Controller } = require('egg')

module.exports = class UserController extends Controller {
    get rules () {
        return {
            update: {
                mute: { type: 'boolean', required: false }
            }
        }
    }

    async list () {
        const { ctx } = this
        let select = '-password'
        if (!ctx.session._isAuthed) {
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
        if (!ctx.session._isAuthed) {
            select += ' -createdAt -updatedAt -github'
        }
        const data = await this.service.user.getItemById(id, select)
        data
            ? ctx.success(data, '用户详情获取成功')
            : ctx.fail('用户详情获取失败')
    }

    async update () {
        const { ctx } = this
        const { id } = ctx.validateParamsObjectId()
        const body = this.ctx.validateBody(this.rules.update)
        const data = await this.service.user.updateItemById(id, body, '-password')
        data
            ? ctx.success(data, '用户更新成功')
            : ctx.fail('用户更新失败')
    }
}
