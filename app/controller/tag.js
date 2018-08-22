/**
 * @desc 标签Controller
 */

const { Controller } = require('egg')
 
module.exports = class TagController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.tag.list()
        if (data) {
            ctx.success(data, '标签列表获取成功')
        } else {
            ctx.fail('标签列表获取失败')
        }
    }

    async item () {
        const { ctx } = this
        const data = await this.service.tag.item()
        if (data) {
            ctx.success(data, '标签详情获取成功')
        } else {
            ctx.fail('标签详情获取失败')
        }
    }

    async create () {
        const { ctx } = this
        const data = await this.service.tag.create()
        data && data.length
			? ctx.success(data[0], '标签创建成功')
			: ctx.fail('标签创建失败')
    }

    async update () {
        const { ctx } = this
        const data = await this.service.tag.update()
        data
			? ctx.success(data, '标签更新成功')
			: ctx.fail('标签更新失败')
    }

    async delete () {
        const { ctx } = this
        const data = await this.service.tag.delete()
        data
			? ctx.success('标签删除成功')
			: ctx.fail('标签删除失败')
    }
}
