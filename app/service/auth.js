/**
 * @desc Auth Services
 */

const { Service } = require('egg')

module.exports = class AuthService extends Service {
    /**
     * @desc 设置cookie，用于登录和退出
     * @param {User} user 登录用户
     * @param {Boolean} isLogin 是否是登录操作
     * @return {String} token 用户token
     */
    setCookie (user, isLogin = false) {
        const { key, domain, maxAge, signed } = this.app.config.session
        const token = this.app.utils.token.sign(this.app, {
            id: user._id,
            name: user.name
        }, isLogin)
        this.ctx.cookies.set(key, token, { signed, domain, maxAge: isLogin ? maxAge : 0, httpOnly: false })
        this.ctx.cookies.set(this.app.config.userCookieKey, user._id, { signed, domain, maxAge: isLogin ? maxAge : 0, httpOnly: false })
        return token
    }

    /**
     * @desc 创建管理员，用于server初始化时
     */
    async seed () {
        const ADMIN = this.config.modelValidate.user.role.optional.ADMIN
        const exist = await this.service.user.getItem({ role: ADMIN })
        if (!exist) {
            const defaultAdmin = this.config.defaultAdmin
            const admin = await this.service.github.getUserInfo(defaultAdmin.name)
            if (admin) {
                await this.service.user.create({
                    role: ADMIN,
                    name: admin.name,
                    email: admin.email || this.config.author.email,
                    password: this.app.utils.encode.bhash(defaultAdmin.password),
                    slogan: admin.bio,
                    site: admin.blog || admin.url,
                    avatar: this.app.proxyUrl(admin.avatar_url),
                    company: admin.company,
                    location: admin.location,
                    github: {
                        id: admin.id,
                        login: admin.login
                    }
                })
            }
        }
    }
}
