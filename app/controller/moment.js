/**
 * @desc 说说 Controller
 */

const { Controller } = require('egg')

module.exports = class MomentController extends Controller {
    get rules () {
        return {
            list: {
                page: { type: 'int', required: true, min: 1 },
                limit: { type: 'int', required: false, min: 1 }
            },
            create: {
                content: { type: 'string', required: true },
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
                content: { type: 'string', required: false },
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
        ctx.query.page = Number(ctx.query.page)
        if (ctx.query.limit) {
            ctx.query.limit = Number(ctx.query.limit)
        }
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, keyword } = ctx.query
        const options = {
            sort: {
                createdAt: -1
            },
            page,
            limit: limit || this.app.setting.limit.momentCount || 10
        }
        const query = {}
        // 搜索关键词
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { content: keywordReg }
            ]
        }
        const data = await this.service.moment.getLimitListByQuery(query, options)
        data
            ? ctx.success(data, '列表获取成功')
            : ctx.fail('列表获取失败')
    }

    async item () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.service.getItemById(params.id)
        data
            ? ctx.success(data, '详情获取成功')
            : ctx.fail('详情获取失败')
    }

    async create () {
        const { ctx } = this
        const body = ctx.validateBody(this.rules.create)
        const { location } = await ctx.getLocation()
        body.location = location
        const data = await this.service.moment.create(body)
        data
            ? ctx.success(data, '创建成功')
            : ctx.fail('创建失败')
    }

    async update () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const body = ctx.validateBody(this.rules.update)
        const data = await this.service.moment.updateItemById(params.id, body)
        data
            ? ctx.success(data, '更新成功')
            : ctx.fail('更新失败')
    }

    async delete () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.moment.deleteItemById(params.id)
        data
            ? ctx.success('删除成功')
            : ctx.fail('删除失败')
    }
}
