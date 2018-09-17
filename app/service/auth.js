/**
 * @desc Auth Services
 */

const jwt = require('jsonwebtoken')
const { Service } = require('egg')

module.exports = class AuthService extends Service {
    sign (app, payload = {}, isLogin = true) {
        return jwt.sign(payload, app.config.secrets, { expiresIn: isLogin ? app.config.session.maxAge : 0 })
    }

    /**
     * @desc 设置cookie，用于登录和退出
     * @param {User} user 登录用户
     * @param {Boolean} isLogin 是否是登录操作
     * @return {String} token 用户token
     */
    setCookie (user, isLogin = true) {
        const { key, domain, maxAge, signed } = this.app.config.session
        const token = this.sign(this.app, {
            id: user._id,
            name: user.name
        }, isLogin)
        const payload = {
            signed,
            domain,
            maxAge:
            isLogin ? maxAge : 0,
            httpOnly: false
        }
        this.ctx.cookies.set(key, token, payload)
        this.ctx.cookies.set(this.app.config.userCookieKey, user._id, payload)
        return token
    }

    /**
     * @desc 创建管理员，用于server初始化时
     */
    async seed () {
        const ADMIN = this.config.modelEnum.user.role.optional.ADMIN
        let admin = await this.service.user.getItem({ role: ADMIN })
        if (!admin) {
            const defaultAdmin = this.config.defaultAdmin
            const userInfo = await this.service.github.getUserInfo(defaultAdmin.name)
            if (userInfo) {
                admin = await this.service.user.create({
                    role: ADMIN,
                    name: userInfo.name,
                    email: userInfo.email || this.config.author.email,
                    password: this.app.utils.encode.bhash(defaultAdmin.password),
                    site: userInfo.blog || userInfo.url,
                    avatar: this.app.proxyUrl(userInfo.avatar_url)
                })
            }
        }
        // 挂载在session上
        this.app._admin = admin
    }

    // 更新session
    async updateSessionUser (admin) {
        this.ctx.session._user = admin || await this.service.user.getItemById(this.ctx.session._user._id, '-password')
        this.logger.info('Session管理员信息更新成功')
    }
}
