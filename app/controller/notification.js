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
                type: { type: 'enum', values: Object.values(this.config.modelEnum.notification.type.optional), required: false },
                classify: { type: 'enum', values: Object.values(this.config.modelEnum.notification.classify.optional), required: false },
                viewed: { type: 'boolean', required: false }
            }
        }
    }

    async list () {
        const { ctx } = this
        ctx.query.page = Number(ctx.query.page)
        const tranArray = ['limit', 'type']
        tranArray.forEach(key => {
            if (ctx.query[key]) {
                ctx.query[key] = Number(ctx.query[key])
            }
        })
        if (ctx.query.viewed) {
            ctx.query.viewed = ctx.query.viewed === 'true'
        }
        ctx.validate(this.rules.list, ctx.query)
        const { page, limit, type, classify, viewed } = ctx.query
        const query = { type, classify, viewed }
        const options = {
            sort: {
                createdAt: -1
            },
            page,
            limit: limit || 10,
            populate: [
                {
                    path: 'target.article',
                    select: 'title description meta'
                }, {
                    path: 'target.user',
                    select: 'name email role github'
                }, {
                    path: 'target.comment',
                    select: 'state spam type meta'
                }, {
                    path: 'actors.from',
                    select: 'name email github'
                }, {
                    path: 'actors.to',
                    select: 'name email github'
                }
            ]
        }
        const data = await this.service.notification.getLimitListByQuery(ctx.processPayload(query), options)
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
            ? ctx.success('通告标记已读成功')
            : ctx.fail('通告标记已读失败')
    }

    async viewAll () {
        const { ctx } = this
        const update = { viewed: true }
        const data = await this.service.notification.updateMany({}, update)
        data
            ? ctx.success('通告全部标记已读成功')
            : ctx.fail('通告全部标记已读失败')
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
