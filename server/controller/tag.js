/**
 * @desc Tag controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const { TagModel, ArticleModel } = require('../model')

exports.list = async (ctx, next) => {
  let data = await TagModel.find({}).sort('-createdAt').catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].toObject) {
        data[i] = data[i].toObject()
      }
      const articles = await ArticleModel.find({ tag: data[i]._id }).exec().catch(err => {
        ctx.log.error(err.message)
        return []
      })
      data[i].count = articles.length
    }
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.item = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()

  let data = await TagModel.findById(id).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    data = data.toObject()
    const articles = await ArticleModel.find({ tag: id })
      .select('-tag')
      .exec()
      .catch(err => {
        ctx.log.error(err.message)
        return []
      })
    data.articles = articles
    data.articles_count = articles.length
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.create = async (ctx, next) => {
  const name = ctx.validateBody('name')
    .required('the "name" parameter is required')
    .notEmpty()
    .isString('the "name" parameter should be String type')
    .val()
  const description = ctx.validateBody('description')
    .optional()
    .isString('the "description" parameter should be String type')
    .val()

  const { length } = await TagModel.find({ name }).exec().catch(err => {
    ctx.log.error(err.message)
    return []
  })

  if (!length) {
    const data = await new TagModel({
      name,
      description
    }).save().catch(err => {
      ctx.log.error(err.message)
      return null
    })

    if (data) {
      return ctx.success(data)
    } else {
      ctx.fail()
    }
  } else {
    ctx.fail(-1, `the tag(${name}) is already exist`)
  }
}

exports.update = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const name = ctx.validateBody('name')
    .optional()
    .isString('the "name" parameter should be String type')
    .val()
  const description = ctx.validateBody('description')
    .optional()
    .isString('the "description" parameter should be String type')
    .val()

  const tag = {}

  name && (tag.name = name)
  description && (tag.description = description)

  const data = await TagModel.findByIdAndUpdate(id, tag, {
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
  const data = await TagModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail()
  }
}
