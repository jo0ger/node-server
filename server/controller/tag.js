/**
 * @desc Tag controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const { TagModel, ArticleModel } = require('../model')

exports.list = async (ctx, next) => {
  const keyword = ctx.validateQuery('keyword').optional().toString().val()

  const query = {}
  // 搜索关键词
   if (keyword) {
    const keywordReg = new RegExp(keyword)
    query.$or = [
      { name:  keywordReg }
    ]
  }

  const data = await TagModel.find(query).sort('-createdAt').catch(err => {
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
  const ext = ctx.validateBody('extends')
    .optional()
    .isArray('the "extends" parameter should be Array type')
    .val()

  const { length } = await TagModel.find({ name }).exec().catch(err => {
    ctx.log.error(err.message)
    return []
  })

  if (!length) {
    const data = await new TagModel({
      name,
      description,
      extends: ext
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
    // 删除所有文章关联关系
    const articles = await ArticleModel.find({ tag: data._id })
      .exec()
      .catch(err => {
        ctx.log.error(err.message)
        return []
      })
    // TODO: 这里应该需要一个容错机制，保证如果有一篇文章没有删除成功的话，需要在规定次数内反复删除
    await Promise.all(
      articles.map(item => {
        return ArticleModel.findByIdAndUpdate(item._id, {
          tag: item.tag.filter(tag => tag.toString() !== data._id.toString())
        }).exec()
      })
    ).catch(err => {
      ctx.log.error(err.message)
    })
    ctx.success()
  } else {
    ctx.fail()
  }
}
