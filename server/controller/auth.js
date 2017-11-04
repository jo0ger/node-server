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
const { bhash, bcompare, getDebug, signToken, proxy, randomString } = require('../util')
const debug = getDebug('Auth')
const debugGithub = getDebug('Github:Auth')
const { getGithubToken, getGithubAuthUserInfo } = require('../service')
const isProd = process.env.NODE_ENV === 'production'

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
  if (!adminId && !ctx._isSnsAuthenticated && !ctx._isAuthenticated) {
    return ctx.fail(401)
  }
  let data = null
  if (ctx._isSnsAuthenticated) {
    // TODO: 第三方信息获取
  } else if (ctx._isAuthenticated) {
    data = await UserModel.findById(adminId)
      .select('-password')
      .exec()
      .catch(err => {
        ctx.log.error(err.message)
        return null
      })
  }

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
// exports.githubLogin = async (ctx, next) => {
//   await passport.authenticate('github', {
//     session: false
//   }, (err, user) => {
//     debugGithub('Github权限验证回调处理开始')
//     const redirectUrl = ctx.session.passport.redirectUrl

//     const { session } = config.auth
//     const opt = { signed: false, maxAge: session.maxAge, httpOnly: false }
//     opt.domain = session.domain || null
//     ctx.cookies.set(config.sns.github.key, user.token, opt)
//     ctx.cookies.set(config.auth.userCookieKey, user._id, opt)

//     debugGithub.success('Github权限验证回调处理成功, 用户ID：%s，用户名：%s', user._id, user.name)
//     return ctx.redirect(redirectUrl)
//   })(ctx)
// }

exports.fetchGithubToken = async (ctx, next) => {
  const code = ctx.validateQuery('code').required('缺少code参数').toString().val()
  const token = await getGithubToken(code)
  if (token) {
    ctx.success(token)
  } else {
    ctx.fail('Token获取失败')
  }
}

exports.fetchGithubUser = async (ctx, next) => {
  const accessToken = ctx.validateQuery('access_token').required('缺少access_token参数').toString().val()
  const data = await getGithubAuthUserInfo(accessToken)
  if (!data) {
    return ctx.fail('用户信息获取失败')
  }
  const user = await createLocalUserFromGithub(data)
  if (user) {
    ctx.success(user)
  } else {
    ctx.fail('用户信息获取失败')
  }
}

async function createLocalUserFromGithub (githubUser) {
  const user = await UserModel.findOne({
    'github.id': githubUser.id
  }).catch(err => {
    debug.error('本地用户查找失败, 错误：', err.message)
    return null
  })
  if (user) {
    const userData = {
      name: githubUser.name || githubUser.login,
      avatar: proxy(githubUser.avatar_url),
      slogan: githubUser.bio,
      github: githubUser,
      role: user.role
    }
    const updatedUser = await UserModel.findByIdAndUpdate(user._id, userData)
      .select('-password -role -createdAt -updatedAt')
      .exec().catch(err => {
        debug.error('本地用户更新失败, 错误：', err.message)
      }) || user

    return updatedUser.toObject()
  } else {
    const newUser = {
      name: githubUser.name || githubUser.login,
      avatar: proxy(githubUser.avatar_url),
      slogan: githubUser.bio,
      github: githubUser,
      role: 1
    }

    const checkUser = await UserModel.findOne({ name: newUser.name }).exec().catch(err => {
      debug.error('本地用户查找失败, 错误：', err.message)
      return true
    })

    if (checkUser) {
      newUser.name += '-' + randomString()
    }

    const data = await new UserModel(newUser).save().catch(err => debug.error('本地用户创建失败, 错误：', err.message))
    return data && data.toObject() || null
  }
}
