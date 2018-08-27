/**
 * @desc 分类 Controller
 */

const { Controller } = require('egg')

module.exports = class CategoryController extends Controller {
    get rules () {
        return {
            list: {
                // 查询关键词
                keyword: { type: 'string', required: false }
            },
            create: {
                name: { type: 'string', required: true },
                description: { type: 'string', required: false },
                extends: {
                    type: 'array',
                    required: false,
                    itemType: 'object',
                    rule: {
                        key: 'string',
                        value: 'string'
                    }
                }
            },
            update: {
                name: { type: 'string', required: false },
                description: { type: 'string', required: false },
                extends: {
                    type: 'array',
                    required: false,
                    itemType: 'object',
                    rule: {
                        key: 'string',
                        value: 'string'
                    }
                }
            }
        }
    }

    async list () {
        const { ctx } = this
        ctx.validate(this.rules.list, ctx.query)
        const query = {}
        const { keyword } = ctx.query
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { name: keywordReg }
            ]
        }
        const data = await this.service.category.getListByQuery(query)
        data
            ? ctx.success(data, '分类列表获取成功')
            : ctx.fail('分类列表获取失败')
    }

    async item () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.category.getItemById(params.id)
        data
            ? ctx.success(data, '分类详情获取成功')
            : ctx.fail('分类详情获取失败')
    }

    async create () {
        const { ctx } = this
        const body = ctx.validateBody(this.service.category.rules.create)
        const { name } = body
        const exists = await this.service.category.getItem({ name })
        if (exists) {
            return ctx.fail('分类已存在')
        }
        const data = await this.service.category.create(body)
        data
            ? ctx.success(data[0], '分类创建成功')
            : ctx.fail('分类创建失败')
    }

    async update () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const body = ctx.validateBody(this.service.category.rules.update)
        const data = await this.service.category.updateById(params.id, body)
        data
            ? ctx.success(data, '分类更新成功')
            : ctx.fail('分类更新失败')
    }

    async delete () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const articles = await this.service.article.getListByQuery({ category: params._id }, 'title')
        if (articles.length) {
            return ctx.fail('该分类下还有文章，不能删除', articles)
        }
        const data = await this.service.category.deleteById(params.id)
        data
            ? ctx.success('分类删除成功')
            : ctx.fail('分类删除失败')
    }
}
