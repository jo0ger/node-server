/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const compose = require('koa-compose')
const koajwt = require('koa-jwt')
const jwt = require('jsonwebtoken')
const config = require('../config')
const { UserModel } = require('../model')
const isProd = process.env.NODE_ENV === 'production'

// 开发环境下，请求携带_DEV_参数，视为已验证
function devAuth () {
  return async (ctx, next) => {
    if (!isProd && ctx.query._DEV_) {
      ctx._devauth_ = true
      await next()
    }
  }
}

function verifyToken () {
  return compose([
    async (ctx, next) => {
      if (ctx._devauth_) {
        return await next()
      }
      const token = ctx.cookies.get(config.auth.cookie.name, { signed: true })
      if (token) {
        try {
          const decodedToken = await jwt.verify(token, config.auth.secretKey)
          if (decodedToken.exp > Math.floor(Date.now() / 1000)) {
            // 已验证权限
            await next()
          }
        } catch (err) {
          ctx.fail(401, err.message)
        }
      }
      ctx.fail(401)
    },
    koajwt({
      secret: config.auth.secretKey,
      passthrough: true
    })
  ])
}

exports.isAuthenticated = () => {
  return compose([
    devAuth(),
    verifyToken(),
    async (ctx, next) => {
      if (ctx._devauth_) {
        return await next()
      } else if (!ctx.state.user) {
        ctx.fail(401)
        return
      }
      await next()
    },
    async (ctx, next) => {
      if (ctx._devauth_) {
        ctx._isAuthenticated = true
        return await next()
      }
      const user = await UserModel.findById(ctx.state.user._id)
      if (!user) {
        ctx.fail(401)
        return
      }
      ctx._user = user
      ctx._isAuthenticated = true
      await next()
    }
  ])
}
