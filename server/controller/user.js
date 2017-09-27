/**
 * @desc User controlelr
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const { UserModel } = require('../model')
const { bhash, bcompare } = require('../util')
const config = require('../config')

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

exports.me = async (ctx, next) => {
  const data = await UserModel
    .findOne({ name: config.author })
    .select('-password -role -createdAt -updatedAt -github')
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
