/**
 * @desc Auth controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const jwt = require('jsonwebtoken')
const passport = require('koa-passport')
const config = require('../config')
const { UserModel } = require('../model')
const { bhash, bcompare, getDebug, signToken } = require('../util')
const debug = getDebug('Auth')
const debugGithub = getDebug('Github:Auth')
const { githubPassport } = require('../service')

githubPassport.init(UserModel, config)

exports.localLogin = async (ctx, next) => {
  const name = ctx.validateBody('name')
    .required('the "name" parameter is required')
    .notEmpty()
    .isString('the "name" parameter should be String type')
    .val()
  const password = ctx.validateBody('password')
    .required('the "password" parameter is required')
    .notEmpty()
    .isString('the "password" parameter should be String type')
    .val()

  const user = await UserModel.findOne({ name }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (user) {
    const vertifyPassword = bcompare(password, user.password)
    if (vertifyPassword) {
      const { session } = config.auth
      const token = signToken({
        id: user._id,
        name: user.name
      })
      ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
      ctx.cookies.set(config.auth.userCookieKey, user._id, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
      debug.success('登录成功, 用户ID：%s，用户名：%s', user._id, user.name)
      ctx.success({
        id: user._id,
        token
      }, 'login success')
    } else {
      ctx.fail(-1, 'incorrect password')
    }
  } else {
    ctx.fail(-1, 'user doesn\'t exist')
  }
}

exports.logout = async (ctx, next) => {
  const { session } = config.auth
  const token = signToken({
    id: ctx._user._id,
    name: ctx._user.name
  }, false)
  ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: 0, httpOnly: false })
  ctx.cookies.set(config.auth.userCookieKey, ctx._user._id, { signed: false, domain: session.domain, maxAge: 0, httpOnly: false })
  debug.success('登出成功, 用户ID：%s，用户名：%s', user._id, user.name)
  ctx.success(null, 'logout success')
}

exports.info = async (ctx, next) => {
  const adminId = ctx._user._id
  if (!adminId) {
    return ctx.fail(401)
  }

  const data = await UserModel.findById(adminId)
    .select('-password')
    .exec()
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })
  if (data) {
    ctx.success({
      info: data,
      token: ctx.session._token
    })
  } else {
    ctx.fail(401)
  }
}

// github login
exports.githubLogin = async (ctx, next) => {
  await passport.authenticate('github', {
    session: false
  }, (err, user) => {
    debugGithub('Github权限验证回调处理开始')
    const redirectUrl = ctx.session.passport.redirectUrl
    const cookieDomain = config.auth.session.domain || null

    const { session } = config.auth
    const token = signToken({
      id: user._id,
      name: user.name
    })
    ctx.cookies.set(config.sns.github.key, token, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
    ctx.cookies.set(config.auth.userCookieKey, user._id, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })

    debugGithub('Github权限验证回调处理成功')
    debugGithub.success('Github权限验证回调处理成功, 用户ID：%s，用户名：%s', user._id, user.name)
    return ctx.redirect(redirectUrl)
  })(ctx)
}
