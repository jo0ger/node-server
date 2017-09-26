/**
 * @desc User controlelr
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')
const { UserModel } = require('../model')
const { bhash, bcompare } = require('../util')

exports.list = async (ctx, next) => {
  let select = '-password'
  if (!ctx._isAuthenticated) {
    select += ' -createdAt -updatedAt'
  }

  const data = await UserModel.find({})
    .sort('-createdAt')
    .select(select)
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.item = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()

  let select = '-password'

  if (!ctx._isAuthenticated) {
    select += ' -role'
  }

  const data = await UserModel.findById(id)
    .select(select)
    .exec()
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })
  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.login = async (ctx, next) => {
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
      const { expired, cookie } = config.auth
      const token = signUserToken({
        id: user._id,
        name: user.name
      })
      ctx.cookies.set(cookie.name, token, { domain: cookie.domain, maxAge: expired, httpOnly: true })
      ctx.cookies.set('user_id', user._id, { domain: cookie.domain, maxAge: expired })
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
  const { expired, cookie } = config.auth
  const token = signUserToken({
    id: ctx._user._id,
    name: ctx._user.name
  }, false)
  ctx.cookies.set(cookie.name, token, {
    maxAge: 0
  })
  ctx.success()
}

exports.update = async (ctx, next) => {
  const name = ctx.validateBody('name').optional().isString('the "name" parameter should be String type').val()
  const password = ctx.validateBody('password').optional().isString('the "password" parameter should be String type').val()
  const slogan = ctx.validateBody('slogan').optional().isString('the "slogan" parameter should be String type').val()
  const description = ctx.validateBody('description').optional().isString('the "description" parameter should be String type').val()
  const avatar = ctx.validateBody('avatar').optional().isString('the "avatar" parameter should be String type').val()
  const role = ctx.validateBody('role').optional().toInt().isIn([0, 1], 'the "role" parameter is not the expected value').val()

  const user = {}

  name && (user.name = name)
  slogan && (user.slogan = slogan)
  description && (user.description = description)
  avatar && (user.avatar = avatar)

  if (role !== undefined) {
    user.role = role
  }

  if (password !== undefined) {
    const oldPassword = ctx.validateBody('old_password')
      .required('the "old_password" parameter is required')
      .notEmpty()
      .isString('the "old_password" parameter should be String type')
      .val()

    const vertifyPassword = bcompare(oldPassword, ctx._user.password)
    if (!vertifyPassword) {
      return ctx.fail(-1, 'old password is not correct')
    }
    user.password = bhash(password)
  }

  const data = await UserModel.findByIdAndUpdate(ctx._user._id, user, {
    new: true
  }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.delete = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const data = await UserModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail()
  }
}

/**
 * @desc jwt sign
 * @param  {Object} payload={}
 * @param  {Boolean} isLogin=false
 */
function signUserToken (payload = {}, isLogin = true) {
  const { secretKey, expired } = config.auth
  return jwt.sign(payload, secretKey, { expiresIn: isLogin ? expired : 0 })
}
