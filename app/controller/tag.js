/**
 * @desc 标签Controller
 */

const { Controller } = require('egg')
 
module.exports = class TagController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.tag.find().sort('-createdAt')
        if (data) {
            ctx.success(data, '标签列表获取成功')
        } else {
            ctx.fail('标签列表获取失败')
        }
    }

    async item () {}

    async create () {}

    async update () {}

    async delete () {}
}
