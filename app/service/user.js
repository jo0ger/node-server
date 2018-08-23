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
            password: {
                password: { type: 'string', required: true },
                oldPassword: { type: 'string', required: true }
            }
        }
    }

    async list () {
        const { ctx } = this
        let select = '-password'
        if (!ctx._isAuthenticated) {
            select += ' -createdAt -updatedAt -role'
        }
        return await this.find()
            .sort('-createdAt')
            .select(select)
            .exec()
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

    async password () {
        const { ctx } = this
        const { body } = ctx.request
        ctx.validate(this.rules.password, body)
        const verify = this.app.utils.encode.bcompare(body.oldPassword, ctx._user.password)
        if (!verify) {
            ctx.throw(200, '原密码错误')
        }
        return await this.updateById(ctx._user._id, {
            password: this.app.utils.encode.bhash(body.password)
        }).exec()
    }
}
