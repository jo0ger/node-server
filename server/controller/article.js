/**
 * @desc Article controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { ArticleModel, TagModel } = require('../model')
const { marked, isObjectId, createObjectId } = require('../util')

exports.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.pageSize).toInt().gt(0, 'the "per_page" parameter should be greater than 0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'the "page" parameter should be greater than 0').val()
  const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const tag = ctx.validateQuery('tag').optional().toString().val()
  const keyword = ctx.validateQuery('keyword').optional().toString().val()

  // 过滤条件
  const options = {
    sort: { createdAt: -1 },
    page,
    limit: pageSize,
    select: '-content -renderedContent',
    populate: [
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
      // { description:  keywordReg }
    ]
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
    queryPs = ArticleModel.findByIdAndUpdate(id, { $inc: { 'meta.pvs': 1 } }, { new: true }).select('-content')
  } else {
    queryPs = ArticleModel.findById(id)
  }

  data = await queryPs.populate('tag').exec().catch(err => {
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
  const description = ctx.validateBody('description')
    .optional()
    .isString('the "description" parameter should be String type')
    .val()
  const data = await new ArticleModel({
    title,
    content,
    renderedContent: marked(content),
    keywords,
    description
  }).save().catch(err => {
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
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const title = ctx.validateBody('title').optional().isString('the "title" parameter should be String type').val()
  const content = ctx.validateBody('content').optional().isString('the "content" parameter should be String type').val()
  const keywords = ctx.validateBody('keywords').optional().isArray('the "keywords" parameter should be Array type').val()
  const description = ctx.validateBody('description').optional().isString('the "description" parameter should be String type').val()
  const tag = ctx.validateBody('tag').optional().isObjectIdArray().val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const thumb = ctx.validateBody('thumb').optional().isString('the "thumb" parameter should be String type').val()
  const issueNumber = ctx.validateBody('issue_number').optional().toInt().gte(1, 'the "issue_number" parameter must be 1 or older').val()
  const article = {}

  title && (article.title = title)
  keywords && (article.keywords = keywords)
  description && (article.description = description)
  tag && (article.tag = tag)
  thumb && (article.thumb = thumb)
  issueNumber && (article.issueNumber = issueNumber)

  if (state !== undefined) {
    article.state = state
  }

  if (content) {
    article.content = content
    article.renderedContent = marked(content)
  }

  const data = await ArticleModel.findByIdAndUpdate(id, article, {
      new: true
    })
    .select('-content -renderedContent')
    .populate('tag')
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
 * 获取相关文章
 * @param  {} ctx           koa ctx
 * @param  {} data          文章数据
 */
async function getRelatedArticles (ctx, data) {
  data.related = []
  if (data && data.tag && data.tag.length) {
    const articles = await ArticleModel.find({ _id: { $nin: [ data._id ] }, state: 1, tag: { $in: data.tag.map(t => t._id) }})
      .select('title thumb createdAt meta')
      .exec()
      .catch(err => {
        ctx.log.error('related articles access failed, err: ', err.message)
        return null
      })
    
      if (articles) {
        data.related = articles
      }
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
      .select('title createdAt thumb')
      .sort('-createdAt')
      .lt('createdAt', data.createdAt)
      .exec()
      .catch(err => {
        ctx.log.error('adjacent articles access failed, err: ', err.message)
        return null
      })
    let next = await ArticleModel.findOne(query)
      .select('title createdAt thumb')
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
