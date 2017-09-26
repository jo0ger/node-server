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

exports.info = async (ctx, next) => {
  const id = ctx.validateQuery('id').required('the "id" parameter is required').toString().isObjectId().val()

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
      const { secretKey, expired, cookie } = config.auth
      const token = signUserToken({
        id: user._id,
        name: user.name
      })
      ctx.cookies.set(cookie.name, token, {
        signed: false,
        domain: cookie.domain,
        maxAge: expired
      })
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

exports.logout = async (ctx, next) => {}

exports.update = async (ctx, next) => {}

/**
 * @desc jwt sign
 * @param  {Object} payload={}
 * @param  {Boolean} isLogin=false
 */
function signUserToken (payload = {}, isLogin = true) {
  const { secretKey, expired } = config.auth
  return jwt.sign(payload, secretKey, { expiresIn: isLogin ? expired : 0 })
}
