/**
 * @desc Auth Controller
 */

const {
    Controller
} = require('egg')

module.exports = class AuthController extends Controller {
    get rules () {
        return {
            login: {
                username: { type: 'string', required: true },
                password: { type: 'string', required: true }
            },
            update: {
                name: { type: 'string', required: false },
                email: { type: 'email', required: false },
                site: { type: 'url', required: false },
                description: { type: 'string', required: false },
                avatar: { type: 'string', required: false },
                slogan: { type: 'string', required: false },
                company: { type: 'string', required: false },
                location: { type: 'string', required: false }
            },
            password: {
                password: { type: 'string', required: true, min: 6 },
                oldPassword: { type: 'string', required: true, min: 6 }
            }
        }
    }

    async login () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.login)
        const user = await this.service.user.getItem({ name: body.username })
        if (!user) {
            return ctx.fail('用户不存在')
        }
        const vertifyPassword = this.app.utils.encode.bcompare(body.password, user.password)
        if (!vertifyPassword) {
            return ctx.fail('密码错误')
        }
        const token = this.service.auth.setCookie(user, true)
        this.logger.info(`用户登录成功, ID：${user._id}，用户名：${user.name}`)
        ctx.success({ id: user._id, token }, '登录成功')
    }

    async logout () {
        const { ctx } = this
        this.service.auth.setCookie(ctx._user, false)
        this.logger.info(`用户退出成功, 用户ID：${ctx._user._id}，用户名：${ctx._user.name}`)
        ctx.success('退出成功')
    }

    async info () {
        this.ctx.success(this.ctx._user, '管理员信息获取成功')
    }

    /**
     * @desc 管理员信息更新，不包含密码更新
     */
    async update () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.update)
        const data = await this.service.user.updateItemById(ctx._user_id, body)
        data
            ? ctx.success(data, '管理员信息更新成功')
            : ctx.fail('管理员信息更新失败')
    }

    /**
     * @desc 管理员密码更新
     */
    async password () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.password)
        const vertifyPassword = this.app.utils.encode.bcompare(body.oldPassword, ctx._user.password)
        if (!vertifyPassword) {
            ctx.throw(200, '原密码错误')
        }
        const data = await this.service.user.updateItemById(ctx._user._id, {
            password: this.app.utils.encode.bhash(body.password)
        })
        data
            ? ctx.success(data, '密码更新成功')
            : ctx.fail('密码更新失败')
    }
}
