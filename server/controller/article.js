/**
 * @desc Article controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { ArticleModel, CategoryModel, TagModel } = require('../model')
const { marked, isObjectId, createObjectId, getDebug } = require('../util')
const debug = getDebug('Article')

exports.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.pageSize).toInt().gt(0, 'the "per_page" parameter should be greater than 0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'the "page" parameter should be greater than 0').val()
  const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const category = ctx.validateQuery('category').optional().toString().val()
  const tag = ctx.validateQuery('tag').optional().toString().val()
  const keyword = ctx.validateQuery('keyword').optional().toString().val()
  // 排序仅后台能用，且order和sortBy需同时传入才起作用
  // -1 desc | 1 asc
  const order = ctx.validateQuery('order').optional().toInt().isIn(
    [-1, 1],
    'invalid "order" parameter, optional value: -1 or 1'
  ).val()
  // createdAt | updatedAt | publishedAt | meta.ups | meta.pvs | meta.comments
  const sortBy = ctx.validateQuery('sort_by').optional().toString().isIn(
    ['createdAt', 'updatedAt', 'publishedAt', 'meta.ups', 'meta.pvs', 'meta.comments'],
    'invalid "sort_by" parameter'
  ).val()

  // 过滤条件
  const options = {
    sort: { createdAt: -1 },
    page,
    limit: pageSize,
    select: '-content -renderedContent',
    populate: [
      {
        path: 'category',
        select: 'name description'
      },
      {
        path: 'tag',
        select: 'name description'
      }
    ]
  }

  // 查询条件
  const query = {}

  if (state !== undefined) {
    query.state = state
  }

   // 搜索关键词
   if (keyword) {
    const keywordReg = new RegExp(keyword)
    query.$or = [
      { title:  keywordReg }
    ]
  }

  // 分类
  if (category) {
    // 如果是id
    if (isObjectId(category)) {
      query.category = category
    } else {
      // 普通字符串，需要先查到id
      const c = await CategoryModel.findOne({ name: category }).exec()
        .catch(err => {
          ctx.log.error(err.message)
          return null
        })
      query.category = c ? c._id : createObjectId()
    }
  }

  // 标签
  if (tag) {
    // 如果是id
    if (isObjectId(tag)) {
      query.tag = tag
    } else {
      // 普通字符串，需要先查到id
      const t = await TagModel.findOne({ name: tag }).exec()
        .catch(err => {
          ctx.log.error(err.message)
          return null
        })
      query.tag = t ? t._id : createObjectId()
    }
  }

  // 未通过权限校验（前台获取文章列表）
  if (!ctx._isAuthenticated) {
    // 将文章状态重置为1
    query.state = 1
    // 文章列表不需要content和state
    options.select = '-content -renderedContent -state'
  } else {
    // 排序
    if (sortBy && order) {
      options.sort = {}
      options.sort[sortBy] = order
    }
  }

  const articles = await ArticleModel.paginate(query, options).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (articles) {
    ctx.success({
      list: articles.docs,
      pagination: {
        total: articles.total,
        current_page: articles.page > articles.pages ? articles.pages : articles.page,
        total_page: articles.pages,
        per_page: articles.limit
      }
    })
  } else {
    ctx.fail(-1, 'the article list access failed')
  }
}

exports.item = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()

  let data = null
  let queryPs = null
  // 只有前台博客访问文章的时候pv才+1
  if (!ctx._isAuthenticated) {
    queryPs = ArticleModel.findOneAndUpdate({ _id: id, state: 1 }, { $inc: { 'meta.pvs': 1 } }, { new: true }).select('-content')
  } else {
    queryPs = ArticleModel.findById(id)
  }

  data = await queryPs.populate([
    {
      path: 'category',
      select: 'name description'
    },
    {
      path: 'tag',
      select: 'name description'
    }
  ]).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    data = data.toObject()
    await getRelatedArticles(ctx, data)
    await getSiblingArticles(ctx, data)
    ctx.success(data)
  } else {
    ctx.fail(-1, 'the article not found')
  }
}

exports.create = async (ctx, next) => {
  const title = ctx.validateBody('title')
    .required('the "title" parameter is required')
    .notEmpty()
    .isString('the "title" parameter should be String type')
    .val()
  const content = ctx.validateBody('content')
    .required('the "content" parameter is required')
    .notEmpty()
    .isString('the "content" parameter should be String type')
    .val()
  const keywords = ctx.validateBody('keywords').optional().defaultTo([]).isArray('the "keywords" parameter should be Array type').val()
  const category = ctx.validateBody('category').optional().isObjectId().val()
  const tag = ctx.validateBody('tag').optional().isObjectIdArray().val()
  const description = ctx.validateBody('description')
    .optional()
    .isString('the "description" parameter should be String type')
    .val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const thumb = ctx.validateBody('thumb').optional().isString('the "thumb" parameter should be String type').val()
  const createdAt = ctx.validateBody('createdAt').optional().toString().val()
  const permalink = ctx.validateBody('permalink')
    .optional()
    .isString('the "permalink" parameter should be String type')
    .val()

  const article = {}

  title && (article.title = title)
  keywords && (article.keywords = keywords)
  description && (article.description = description)
  category && (article.category = category)
  tag && (article.tag = tag)
  thumb && (article.thumb = thumb)
  createdAt && (article.createdAt = new Date(createdAt))
  permalink && (article.permalink = permalink)

  if (state !== undefined) {
    article.state = state
  }

  if (content) {
    article.content = content
    article.renderedContent = marked(content)
  }

  let data = await new ArticleModel(article).save().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    if (!data.permalink) {
      // 更新永久链接
      data = await ArticleModel.findByIdAndUpdate(data._id, {
        permalink: `${config.site}/blog/article/${data._id}`
      }, {
        new : true
      }).exec().catch(err => {
        ctx.log.error(err.message)
        return data
      })
    }
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.update = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const title = ctx.validateBody('title').optional().isString('the "title" parameter should be String type').val()
  const content = ctx.validateBody('content').optional().isString('the "content" parameter should be String type').val()
  const keywords = ctx.validateBody('keywords').optional().isArray('the "keywords" parameter should be Array type').val()
  const description = ctx.validateBody('description').optional().isString('the "description" parameter should be String type').val()
  const category = ctx.validateBody('category').optional().isObjectId().val()
  const tag = ctx.validateBody('tag').optional().isObjectIdArray().val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const thumb = ctx.validateBody('thumb').optional().isString('the "thumb" parameter should be String type').val()
  const createdAt = ctx.validateBody('createdAt').optional().toString().val()

  const article = {}
  const cache = await ArticleModel.findById(id).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  title && (article.title = title)
  keywords && (article.keywords = keywords)
  description && (article.description = description)
  category && (article.category = category)
  tag && (article.tag = tag)
  thumb && (article.thumb = thumb)
  createdAt && (article.createdAt = new Date(createdAt))

  if (state !== undefined) {
    article.state = state
  }

  if (content) {
    article.content = content
    article.renderedContent = marked(content)
  }

  if (cache) {
    // 如果文章状态由草稿变为发布，更新发布时间
    if (cache.state !== article.state && article.state === 1) {
      article.publishedAt = Date.now()
    }
  }

  const data = await ArticleModel.findByIdAndUpdate(id, article, {
      new: true
    })
    .populate('category tag')
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

exports.delete = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const data = await ArticleModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail()
  }
}

exports.like = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()

  const data = await ArticleModel.findByIdAndUpdate(id, {
    $inc: {
      'meta.ups': 1
    }
  }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success()
  } else {
    ctx.fail(-1, 'the article not found')
  }
}

/**
 * 根据标签获取相关文章
 * @param  {} ctx           koa ctx
 * @param  {} data          文章数据
 */
async function getRelatedArticles (ctx, data) {
  data.related = []
  let { _id, tag = [] } = data
  const articles = await ArticleModel.find({
    _id: { $nin: [ _id ] },
    state: 1,
    tag: { $in: tag.map(t => t._id) }}
  )
  .select('title thumb createdAt publishedAt meta category')
  .populate({
    path: 'category',
    select: 'name description'
  })
  .exec()
  .catch(err => {
    ctx.log.error('related articles access failed, err: ', err.message)
    return null
  })

  if (articles) {
    // 取前10篇
    data.related = articles.slice(0, 10)
  }
}

/**
 * 获取相邻的文章
 * @param  {} ctx           koa ctx
 * @param  {} data          文章数据
 */
async function getSiblingArticles (ctx, data) {
  if (data && data._id) {
    const query = {}
    // 如果未通过权限校验，将文章状态重置为1
    if (!ctx._isAuthenticated) {
      query.state = 1
    }
    let prev = await ArticleModel.findOne(query)
      .select('title createdAt publishedAt thumb category')
      .populate({
        path: 'category',
        select: 'name description'
      })
      .sort('-createdAt')
      .lt('createdAt', data.createdAt)
      .exec()
      .catch(err => {
        ctx.log.error('adjacent articles access failed, err: ', err.message)
        return null
      })
    let next = await ArticleModel.findOne(query)
      .select('title createdAt publishedAt thumb category')
      .populate({
        path: 'category',
        select: 'name description'
      })
      .sort('createdAt')
      .gt('createdAt', data.createdAt)
      .exec()
      .catch(err => {
        ctx.log.error('adjacent articles access failed, err: ', err.message)
        return null
      })
    prev = prev && prev.toObject()
    next = next && next.toObject()
    data.adjacent = { prev, next }
  }
}
