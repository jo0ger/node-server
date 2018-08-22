/**
 * @desc Tag Services
 */

const ProxyService = require('./proxy')

module.exports = class TagService extends ProxyService {
    get model () {
        return this.app.model.Tag
    }

    get rules () {
        return {
            list: {
                // 查询关键词
                keyword: { type: 'string', required: false }
            },
            create: {
                name: { type: 'string', required: true },
                keyword: { type: 'string', required: false },
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
                keyword: { type: 'string', required: false },
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
        const { ctx, app, service } = this
        ctx.validate(this.rules.list, ctx.query)
        const query = {}
        const { keyword } = ctx.query
        if (keyword) {
            const keywordReg = new RegExp(keyword)
            query.$or = [
                { name: keywordReg }
            ]
        }
        const data = await this.find(query).sort('-createdAt').exec()

        if (data) {
            const isFunction = app.utils.validate.isFunction
            const PUBLISH = app.config.modelValidate.article.state.optional.PUBLISH
            await Promise.all(data.map((item, index) => {
                const toObject = item.toObject
                if (isFunction(toObject)) {
                    item = item.toObject()
                }
                return service.article.find({
                    tag: item._id,
                    state: PUBLISH
                }).exec().then(articles => {
                    item.count = articles.length
                    data[index] = item
                })
            }))
        }

        return data
    }

    async item () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        let data = await this.findById(params.id).exec()
        if (data) {
            data = data.toObject()
            const articles = await this.service.article.find({ tag: params.id })
                .select('-tag')
                .exec()
            data.articles = articles
            data.articlesCount = articles.length
        }
        return data
    }

    async create () {
        const { ctx } = this
        const { body } = ctx.request
        ctx.validate(this.rules.create, body)
        const exists = await this.find({ name: body.name }).exec()
        if (exists && exists.length) {
            ctx.throw(200, '标签已经存在')
        }
        return await this.newAndSave(body)
    }

    async update () {
        const { ctx } = this
        const { params } = ctx
        const { body } = ctx.request
        ctx.validateObjectId(params)
        ctx.validate(this.rules.update, body)
        return await this.updateById(params.id, body).exec()
    }

    async delete () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        const articles = await this.service.article.find({ tag: params.id }).exec()
        if (articles && articles.length) {
            ctx.throw(200, '该标签下有文章，不能删除')
        }
        const data = await this.deleteById(params.id).exec()
        return data && data.ok && data.n
    }
}
