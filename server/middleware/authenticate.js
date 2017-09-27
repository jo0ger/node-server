/**
 * @desc Auth middleware
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const compose = require('koa-compose')
const koajwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const passport = require('koa-passport')
const config = require('../config')
const { UserModel } = require('../model')
const isProd = process.env.NODE_ENV === 'production'

// 开发环境下，请求携带_DEV_参数，视为已验证
function devAuth () {
  return async (ctx, next) => {
    if (!isProd && ctx.query._DEV_) {
      ctx.session._verify = true
    }
    await next()
  }
}

function verifyToken () {
  return async (ctx, next) => {
    if (ctx._devauth) {
      return await next()
    }
    ctx.session._verify = false
    const token = ctx.cookies.get(config.auth.session.key)
    if (token) {
      const decodedToken = await jwt.verify(token, config.auth.secrets)
      if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
        // 已验证权限
        ctx.session._verify = true
      }
    }
    await next()
  }
}

exports.isAuthenticated = () => {
  return compose([
    devAuth(),
    verifyToken(),
    async (ctx, next) => {
      if (!ctx.session._verify) {
        return ctx.fail(401)
      }

      const userId = ctx.cookies.get('user_id', { signed: false })

      const user = await UserModel.findById(userId).exec().catch(err => {
        ctx.log.error(err.message)
        return null
      })
      if (!user) {
        return ctx.fail(401, 'the user was not found')
      }
      ctx._user = user
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
      if (ctx.session._verify) {
        return ctx.fail(-1, 'you have already logged in')
      }
      ctx.session.passport = {
        redirectUrl: ctx.query.redirectUrl || '/'
      }
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
      return ctx.fail(-1, 'please login first')
    }
    await next()
  }
])
