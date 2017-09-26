/**
 * @desc Article controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { ArticleModel, TagModel } = require('../model')
const { marked } = require('../util')
const ctrl = {
}

ctrl.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.pageSize).toInt().gt(0, 'the "per_page" parameter should be greater than 0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'the "page" parameter should be greater than 0').val()
  const state = ctx.validateQuery('state').defaultTo(1).optional().toInt().isIn([0, 1], 'the "state" parameter is not the expected value').val()
  const tag = ctx.validateQuery('tag').isObjectId().val()
  const keyword = ctx.validateQuery('keyword').toString().defaultTo().val()

  // 过滤条件
  const options = {
    sort: { createdAt: -1 },
    page,
    limit: pageSize,
    populate: [
      {
        path: 'tag',
        select: 'name description',
        match: {
          forbidden: 0
        }
      }
    ]
  }

  const query = { state }

   // 搜索关键词
   if (keyword) {
    const keywordReg = new RegExp(keyword)
    query.$or = [
      { title:  keywordReg },
      { description:  keywordReg }
    ]
  }

  // 标签
  if (tag) {
    // 如果是id
    if (isObjectId(tag)) {
      query.tag = tag
    } else {
      // 普通字符串，需要先查到id
      await TagModel.findOne({ name: tag }).exec()
        .then(t => {
          query.tag = t && t._id || createObjectId()
        })
        .catch(() => {
          query.tag = createObjectId()
        })
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
    ctx.fail()
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

ctrl.item = async (ctx, next) => {
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
    ctx.fail()
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

ctrl.create = async (ctx, next) => {
  const title = ctx.validateBody('title').required('the title parameter is required').notEmpty().val()
  const content = ctx.validateBody('content').required('the content parameter is required').notEmpty().val()
  const keywords = ctx.validateBody('keywords').defaultTo([]).isArray('the keywords parameter should be Array type').val()
  const description = ctx.validateBody('description').optional().isString().val()
  const data = await new ArticleModel({
    title,
    content,
    renderedContent: marked(content),
    keywords,
    description
  }).save().catch(err => {
    ctx.log.error(err.message)
    ctx.fail()
  })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

ctrl.update = async (ctx, next) => {
  const title = ctx.validateBody('title').required('the title parameter is required').notEmpty().val()
  const content = ctx.validateBody('content').required('the content parameter is required').notEmpty().val()
  const keywords = ctx.validateBody('keywords').defaultTo([]).isArray('the keywords parameter should be Array type').val()
  const description = ctx.validateBody('description').optional().isString().val()
  const tag = ctx.validateBody('tag').defaultTo([]).isObjectIdArray().val()
  console.log(tag)
}

ctrl.delete = async (ctx, next) => {}

ctrl.like = async (ctx, next) => {}

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
      })
    let next = await ArticleModel.findOne(query)
      .select('title createdAt thumb')
      .sort('createdAt')
      .gt('createdAt', data.createdAt)
      .exec()
      .catch(err => {
        ctx.log.error('adjacent articles access failed, err: ', err.message)
      })
    prev = prev && prev.toObject()
    next = next && next.toObject()
    data.adjacent = { prev, next }
  }
}

module.exports = ctrl
