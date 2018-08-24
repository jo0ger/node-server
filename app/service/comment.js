/**
 * @desc Comment Services
 */

const ProxyService = require('./proxy')

module.exports = class CommentService extends ProxyService {
    get model () {
        return this.app.model.Comment
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
        ctx.validateParamsObjectId()
    }

    async like () {}
}
