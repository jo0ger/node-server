/**
 * @desc Article controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { ArticleModel, TagModel } = require('../model')
const ctrl = {
  frontend: {},
  backend: {}
}

ctrl.frontend.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.pageSize).toInt().gt(0, 'the per_page parameter should be greater than 0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'the page parameter should be greater than 0').val()
  const state = ctx.validateQuery('state').defaultTo(1).optional().toInt().isIn([0, 1], 'the expected value of the article state is 0 or 1').val()
  const tag = ctx.validateQuery('tag').defaultTo('').toString().val()
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

  const query = {
    state
  }

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
          logger.error('标签查找失败')
          query.tag = createObjectId()
        })
    }
  }

  const articles = await ArticleModel.paginate(query, options).catch(err => {
    ctx.log.error(err.message)
    ctx.fail(-1, '文章列表获取失败')
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
  }
}

ctrl.frontend.item = async (ctx, next) => {
  ctx.success('222')
}

ctrl.backend.list = async (ctx, next) => {
  ctx.success('123')
}

ctrl.backend.item = async (ctx, next) => {
  ctx.success('222')
}

ctrl.backend.create = async (ctx, next) => {}

ctrl.backend.update = async (ctx, next) => {}

ctrl.backend.delete = async (ctx, next) => {}

module.exports = ctrl
