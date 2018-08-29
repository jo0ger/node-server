/**
 * @desc jwt 校验
 */

const compose = require('koa-compose')
const jwt = require('jsonwebtoken')

module.exports = app => {
    return compose([
        verifyToken(app),
        async (ctx, next) => {
            if (!ctx.session._verify) {
                return ctx.fail(401)
            }
            const userId = ctx.cookies.get(app.config.userCookieKey, {
                signed: false
            })
            const user = await ctx.service.user.getItemById(userId, '-password')
            if (!user) {
                return ctx.fail(401, '用户不存在')
            }
            ctx.session._user = user
            ctx.session._isAdmin = user.role === app.config.modelValidate.user.role.optional.ADMIN
            ctx.session._isAuthed = true
            await next()
        }
    ])
}

// 验证登录token
function verifyToken (app) {
    const { config, logger } = app
    return async (ctx, next) => {
        ctx.session._verify = false
        const token = ctx.cookies.get(config.session.key)
        if (token) {
            let decodedToken = null
            try {
                decodedToken = await jwt.verify(token, config.secrets)
            } catch (err) {
                logger.warn('Token校验出错，错误：' + err.message)
                return ctx.fail(401, '登录失效，请重新登录')
            }
            if (decodedToken && decodedToken.exp > Math.floor(Date.now() / 1000)) {
                // 已校验权限
                ctx.session._verify = true
                ctx.session._token = token
                logger.info('Token校验成功')
            }
        } else {
            return ctx.fail('请先登录')
        }
        await next()
    }
}
