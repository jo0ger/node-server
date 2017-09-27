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
const { bhash, bcompare, setDebug, signToken } = require('../util')
const debug = setDebug('auth:github')

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
      ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: true })
      ctx.cookies.set('user_id', user._id, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
      debug.success('login success, user: ', user._id)
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
  ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: 0, httpOnly: true })
  ctx.cookies.set('user_id', ctx._user._id, { signed: false, domain: session.domain, maxAge: 0, httpOnly: false })
  debug.success('logout success, user: ', ctx._user._id)
  ctx.success(null, 'logout success')
}

// github login
exports.githubLogin = async (ctx, next) => {
  await passport.authenticate('github', {
    session: false
  }, (err, user) => {
    debug('github auth callback start')
    const redirectUrl = ctx.session.passport.redirectUrl || '/'
    const cookieDomain = config.auth.session.domain || null

    const { session } = config.auth
    const token = signToken({
      id: user._id,
      name: user.name
    })
    ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: true })
    ctx.cookies.set('user_id', user._id, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })

    debug('github auth callback finish')
    debug.success('github login success, user: ', user._id)
    return ctx.redirect(redirectUrl)
  })(ctx)
}
