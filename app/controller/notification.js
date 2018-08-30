/**
 * @desc 通告 Controller
 */

const { Controller } = require('egg')

module.exports = class NotificationController extends Controller {
    get rules () {
        return {
            list: {
                // 查询关键词
                page: { type: 'int', required: true, min: 1 },
                limit: { type: 'int', required: false, min: 1 },
                type: { type: 'enum', values: Object.values(this.config.modelValidate.notification.type.optional), required: false },
                classify: { type: 'enum', values: Object.values(this.config.modelValidate.notification.classify.optional), required: false },
                viewed: { type: 'boolean', required: false }
            },
            view: {
                viewed: { type: 'boolean', required: false }
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
        const { page, limit } = ctx.query
        const options = {
            sort: {
                createdAt: -1
            },
            page,
            limit: limit || 10,
            populate: [
                {
                    path: 'article',
                    select: 'title description meta'
                }, {
                    path: 'user',
                    select: 'name email role'
                }, {
                    path: 'comment',
                    select: 'state spam type meta'
                }
            ]
        }
        const data = await this.service.notification.getLimitListByQuery(ctx.processPayload(ctx.query), options)
        data
            ? ctx.success(data, '通告列表获取成功')
            : ctx.fail('通告列表获取失败')
    }

    async view () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const update = { viewed: true }
        const data = await this.service.notification.updateItemById(params.id, update)
        data
            ? ctx.success(data, '标记已读成功')
            : ctx.fail('标记已读失败')
    }

    async viewAll () {
        const { ctx } = this
        const update = { viewed: true }
        const data = await this.service.notification.updateMany({}, update)
        data
            ? ctx.success(data, '全部标记已读成功')
            : ctx.fail('全部标记已读失败')
    }

    async delete () {
        const { ctx } = this
        const params = ctx.validateParamsObjectId()
        const data = await this.service.notification.deleteItemById(params.id)
        data
            ? ctx.success('通告删除成功')
            : ctx.fail('通告删除失败')
    }
}
