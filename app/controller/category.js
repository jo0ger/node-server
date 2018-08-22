/**
 * @desc 分类 Controller
 */

const { Controller } = require('egg')
 
module.exports = class CategoryController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.category.list()
        data
            ? ctx.success(data, '分类列表获取成功')
            : ctx.fail('分类列表获取失败')
    }

    async item () {
        const { ctx } = this
        const data = await this.service.category.item()
        data
            ? ctx.success(data, '分类详情获取成功')
            : ctx.fail('分类详情获取失败')
    }

    async create () {
        const { ctx } = this
        const data = await this.service.category.create()
        data && data.length
			? ctx.success(data[0], '分类创建成功')
			: ctx.fail('分类创建失败')
    }

    async update () {
        const { ctx } = this
        const data = await this.service.category.update()
        data
			? ctx.success(data, '分类更新成功')
			: ctx.fail('分类更新失败')
    }

    async delete () {
        const { ctx } = this
        const data = await this.service.category.delete()
        data
			? ctx.success('分类删除成功')
			: ctx.fail('分类删除失败')
    }
}
