/**
 * @desc User Services
 */

const ProxyService = require('./proxy')
 
module.exports = class UserService extends ProxyService {
    get model () {
        return this.app.model.User
    }

    get rules () {
        return {
            // todo
        }
    }

    async list () {
        const { ctx } = this
        let select = '-password'
        if (!ctx._isAuthenticated) {
            select += ' -createdAt -updatedAt -role'
        }
        return await this.find().sort('-createdAt').select(select).exec()
    }

    async item () {
        const { ctx } = this
        const { params } = ctx
        ctx.validateObjectId(params)
        let select = '-password'
        if (!ctx._isAuthenticated) {
            select += ' -createdAt -updatedAt -github'
        }
        return await this.findById(params.id).select(select).exec()
    }

    async update () {}
}
