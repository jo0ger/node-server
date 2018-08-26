/**
 * @desc Auth Services
 */

const { Service } = require('egg')

module.exports = class AuthService extends Service {
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
                password: { type: 'string', required: true },
                oldPassword: { type: 'string', required: true }
            }
        }
    }

    async login () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.login)
        const user = await this.service.user.findOne({ name: body.username }).exec()
        if (!user) {
            return ctx.fail('用户不存在')
        }
        const vertifyPassword = this.app.utils.encode.bcompare(body.password, user.password)
        if (vertifyPassword) {
            const { key, domain, maxAge, signed } = this.app.config.session
            const token = this.app.utils.token.sign(this.app, {
                id: user._id,
                name: user.name
            })
            ctx.cookies.set(key, token, { signed, domain, maxAge, httpOnly: false })
            ctx.cookies.set(this.app.config.userCookieKey, user._id, { signed, domain, maxAge, httpOnly: false })
            this.logger.info(`用户登录成功, ID：${user._id}，用户名：${user.name}`)
            ctx.success({
                id: user._id,
                token
            }, '登录成功')
        } else {
            ctx.fail('密码错误')
        }
    }

    async logout () {
        const { ctx } = this
        const { key, domain, signed } = this.app.config.session
        const token = this.app.utils.token.sign(this.app, {
            id: ctx._user._id,
            name: ctx._user.name
        }, false)
        ctx.cookies.set(key, token, { signed, domain, maxAge: 0, httpOnly: false })
        ctx.cookies.set(this.app.config.auth.userCookieKey, ctx._user._id, { signed, domain, maxAge: 0, httpOnly: false })
        this.logger.info(`用户登出成功, 用户ID：${ctx.user._id}，用户名：${ctx.user.name}`)
        ctx.success('登出成功')
    }

    async info () {
        const { ctx } = this
        const adminId = ctx._user._id
        if (!adminId && !ctx._isAuthed) {
            return ctx.fail(401)
        }
        let data = null
        if (ctx._isAuthed) {
            data = await this.service.user.findById(adminId).select('-password').exec()
        }
        return {
            info: data,
            token: ctx.session._token
        }
    }

    async update () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.update)
        return await this.service.user.updateById(ctx._user_id, body)
    }

    async password () {
        const { ctx } = this
        const body = this.ctx.validateBody(this.rules.password)
        const verify = this.app.utils.encode.bcompare(body.oldPassword, ctx._user.password)
        if (!verify) {
            ctx.throw(200, '原密码错误')
        }
        return await this.updateById(ctx._user._id, {
            password: this.app.utils.encode.bhash(body.password)
        }).exec()
    }

    async seed () {
        const ADMIN = this.config.modelValidate.user.role.optional.ADMIN
        const exist = await this.service.user.findOne({ role: ADMIN }).exec()
        if (!exist) {
            await this.create()
        }
    }

    async create (name) {
        const ADMIN = this.config.modelValidate.user.role.optional.ADMIN
        const defaultAdmin = this.config.defaultAdmin
        const admin = await this.service.common.getGithubUserInfo(name || defaultAdmin.name)
        if (!admin) {
            return this.logger.warn('管理员创建失败')
        }
        const data = await this.service.user.create({
            role: ADMIN,
            name: admin.name,
            email: admin.email || this.config.pkg.author.email,
            password: this.app.utils.encode.bhash(defaultAdmin.password),
            slogan: admin.bio,
            site: admin.blog || admin.url,
            avatar: this.service.common.proxyUrl(admin.avatar_url),
            company: admin.company,
            location: admin.location,
            github: {
                id: admin.id,
                login: admin.login
            }
        })
        if (!data) {
            return this.logger.warn(`管理员【${admin.name}】创建失败`)
        }
        this.logger.info(`管理员【${admin.name}】创建成功`)
    }
}
