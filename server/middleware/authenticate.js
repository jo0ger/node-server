/**
 * @desc Auth middleware
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const compose = require('koa-compose')
const jwt = require('jsonwebtoken')
const passport = require('koa-passport')
const config = require('../config')
const { UserModel } = require('../model')
const debug = require('../util').getDebug('Auth')
const isProd = process.env.NODE_ENV === 'production'

function verifyToken () {
  return async (ctx, next) => {
    ctx.session._verify = false
    const token = ctx.cookies.get(config.auth.session.key)

    if (token) {
      let decodedToken = null
      try {
        decodedToken = await jwt.verify(token, config.auth.secrets)
      } catch (err) {
        debug.error('Token校验出错，错误：', err.message)
        return ctx.fail(401)
      }

      if (decodedToken && decodedToken.exp > Math.floor(Date.now() / 1000)) {
        // 已校验权限
        ctx.session._verify = true
        ctx.session._token = token
        debug.success('Token校验成功')
      }
    }
    await next()
  }
}

exports.isAuthenticated = () => {
  return compose([
    verifyToken(),
    async (ctx, next) => {
      if (!ctx.session._verify) {
        return ctx.fail(401)
      }

      const userId = ctx.cookies.get(config.auth.userCookieKey, { signed: false })
      const user = await UserModel.findById(userId).exec().catch(err => {
        debug.error('用户查找失败, 错误：', err.message)
        ctx.log.error(err.message)
        return null
      })
      if (!user) {
        return ctx.fail(401, '用户不存在')
      }
      ctx._user = user.toObject()
      ctx._isAuthenticated = true
      await next()
    }
  ])
}

exports.snsAuth = (name = '') => {
  return compose([
    verifyToken(),
    async (ctx, next) => {
      // 如果已经登录
      const redirectUrl = ctx.query.redirectUrl || config.site
      if (ctx.session._verify) {
        debug.info('您已经登录, 重定向中...')
        return ctx.redirect(redirectUrl)
      }
      ctx.session.passport = { redirectUrl }
      await next()
    },
    passport.authenticate(name, {
      failureRedirect: '/',
      session: false
    })
  ])
}

exports.snsLogout = () => compose([
  verifyToken(),
  async (ctx, next) => {
    if (!ctx.session._verify) {
      return ctx.fail(-1, '请您先登录')
    }
    await next()
  }
])
