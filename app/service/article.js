/**
 * @desc Article Services
 */

const ProxyService = require('./proxy')
 
module.exports = class ArticleService extends ProxyService {
    get model () {
        return this.app.model.Article
    }

    get rules () {
        return {
            // todo
        }
    }

    async list () {}

    async item () {}

    async create () {}

    async update () {}

    async delete () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        const data = await this.deleteById(params.id).exec()
        return data && data.ok && data.n
    }

    async like () {}

    async archives () {}
}
