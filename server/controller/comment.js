/**
 * @desc Comment controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 28 Oct 2017
 */

'use strict'

const geoip = require('geoip-lite')
const config = require('../config')
const { getAkismetClient } = require('../akismet')
const { CommentModel, UserModel, ArticleModel } = require('../model')
const { marked, isObjectId, createObjectId, getDebug } = require('../util')
const debug = getDebug('Comment')

exports.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.commentLimit).toInt().gt(0, '每页评论数量必须大于0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, '页码参数必须大于0').val()
  const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], '评论状态参数无效').val()
  const type = ctx.validateQuery('type').optional().toInt().isIn([0, 1], '评论类型参数无效').val()
  const author = ctx.validateQuery('author').optional().toString().isObjectId('用户ID参数无效').val()
  const article = ctx.validateQuery('article').optional().toString().isObjectId('文章ID参数无效').val()
  const keyword = ctx.validateQuery('keyword').optional().toString().val()
  // 时间区间查询仅后台可用，且依赖于createdAt
  const startDate = ctx.validateQuery('start_date').optional().toString().val()
  const endDate = ctx.validateQuery('end_date').optional().toString().val()
  // 排序仅后台能用，且order和sortBy需同时传入才起作用
  // -1 desc | 1 asc
  const order = ctx.validateQuery('order').optional().toInt().isIn([-1, 1], '排序方式参数无效').val()
  // createdAt | updatedAt | ups
  const sortBy = ctx.validateQuery('sort_by').optional().toString().isIn(['createdAt', 'updatedAt', 'ups'], '排序项参数无效').val()

  // 过滤条件
  const options = {
    sort: { createdAt: 1 },
    page,
    limit: pageSize,
    select: '',
    populate: [
      {
        path: 'author',
        select: !ctx._isAuthenticated ? 'github' : ''
      },
      {
        path: 'parent',
        select: 'author meta sticky ups',
        match: {
          state: 1
        }
      },
      {
        path: 'forward',
        select: 'author meta sticky ups',
        match: {
          state: 1
        }
      }
    ]
  }

  // 查询条件
  const query = {}

  if (type !== undefined) {
    query.type = type
  }

  if (state !== undefined) {
    query.state = state
  }

   // 搜索关键词
   if (keyword) {
    const keywordReg = new RegExp(keyword)
    query.$or = [
      { content:  keywordReg }
    ]
  }

  // 用户
  if (author) {
    // 如果是id
    if (isObjectId(author)) {
      query.author = author
    } else {
      // 普通字符串，需要先查到id
      const u = await UserModel.findOne({ name: author }).exec()
        .catch(err => {
          ctx.log.error(err.message)
          return null
        })
      query.author = u ? u._id : createObjectId()
    }
  }

  // 文章
  if (article) {
    // 如果是id
    if (isObjectId(article)) {
      query.article = article
    } else {
      // 普通字符串，需要先查到id
      const a = await ArticleModel.findOne({ name: article }).exec()
        .catch(err => {
          ctx.log.error(err.message)
          return null
        })
      query.article = a ? a._id : createObjectId()
    }
  }

  // 未通过权限校验（前台获取评论列表）
  if (!ctx._isAuthenticated) {
    // 将评论状态重置为1
    query.state = 1
    query.akimetSpam = false
    // 评论列表不需要content和state
    options.select = '-content -state -updatedAt -akimetSpam -type'
  } else {
    // 排序
    if (sortBy && order) {
      options.sort = {}
      options.sort[sortBy] = order
    }

    // 起始日期
    if (startDate) {
      const $gte = new Date(startDate)
      if ($gte.toString() !== 'Invalid Date') {
        query.createdAt = { $gte }
      }
    }

    // 结束日期
    if (endDate) {
      const $lte = new Date(endDate)
      if ($lte.toString() !== 'Invalid Date') {
        query.createdAt = Object.assign({}, query.createdAt, { $lte })
      }
    }
  }

  const comments = await CommentModel.paginate(query, options).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (comments) {
    ctx.success({
      list: comments.docs,
      pagination: {
        total: comments.total,
        current_page: comments.page > comments.pages ? comments.pages : comments.page,
        total_page: comments.pages,
        per_page: comments.limit
      }
    })
  } else {
    ctx.fail(-1)
  }
}

exports.item = async (ctx, next) => {
  const id = ctx.validateParam('id').required('评论ID参数无效').toString().isObjectId('评论ID参数无效').val()
  
  let data = null
  let queryPs = null
  if (!ctx._isAuthenticated) {
    queryPs = CommentModel.findById(id, { state: 1, akimetSpam: false })
      .select('-content -state -updatedAt -type -akimetSpam')
      .populate({
        path: 'author',
        select: 'github'
      })
      .populate({
        path: 'parent',
        select: 'author meta sticky ups'
      })
      .populate({
        path: 'forward',
        select: 'author meta sticky ups'
      })
  } else {
    queryPs = CommentModel.findById(id)
  }

  data = await queryPs.exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    data = data.toObject()
    ctx.success(data)
  } else {
    ctx.fail('评论不存在')
  }
}

exports.create = async (ctx, next) => {
  const content = ctx.validateBody('content')
    .required('内容参数必填')
    .notEmpty()
    .isString('内容参数必须是字符串类型')
    .val()
  const author = ctx.validateBody('author').required('用户ID参数必填').toString().isObjectId('用户ID参数无效').val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], '评论状态参数无效').val()
  const sticky = ctx.validateBody('sticky').optional().toInt().isIn([0, 1], '置顶参数无效').val()
  const type = ctx.validateBody('type').defaultTo(0).toInt().isIn([0, 1], '评论类型参数无效').val()
  const article = ctx.validateBody('article').optional().toString().isObjectId('文章ID参数无效').val()
  const parent = ctx.validateBody('parent').optional().toString().isObjectId('父评论ID参数无效').val()
  const forward = ctx.validateBody('forward').optional().toString().isObjectId('前置评论ID参数无效').val()
  const req = ctx.req
  const comment = { content }

  const user = await UserModel.findById(author).select('github').exec().catch(err => {
    debug.error('用户查找失败，错误：', err.message)
    ctx.log.error(err.message)
    return null
  })

  if (!user) {
    return ctx.fail('用户不存在')
  }

  
  if (type === undefined || type === 0) {
    if (!article) {
      return ctx.fail('缺少文章ID参数')
    }
    comment.article = article
  }
  
  if (parent && !forward || !parent && forward) {
    return ctx.fail('父评论ID和前置评论ID必须同时存在')
  }

  // 获取ip
  const ip = (req.headers['x-forwarded-for'] || 
    req.headers['x-real-ip'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    req.ip ||
    req.ips[0]).replace('::ffff:', '')
  const location = geoip.lookup(ip)
  comment.meta = {}
  comment.meta.location = location || null
  comment.meta.ip = ip
  comment.meta.ua = req.headers['user-agent'] || ''
  comment.meta.referer = req.headers.referer || ''

  // 先判断是不是垃圾邮件
  const akismetClient = getAkismetClient()
  let isSpam = false
  const permalink = getPermalink(comment)
  if (akismetClient) {
    isSpam = await akismetClient.checkSpam({
      user_ip : ip,                             // Required! 
      user_agent : comment.meta.ua,             // Required! 
      referrer : comment.meta.referer,          // Required! 
      permalink,
      comment_type : getCommentType(type),
      comment_author : user.github.login,
      comment_author_email : user.github.email,
      comment_author_url : user.github.blog,
      comment_content : content,
      is_test : process.env.NODE_ENV === 'development'
    })
  }

  // 如果是Spam评论
  if (isSpam) {
    return ctx.fail('检测为垃圾评论，该评论将不会显示')
  }

  parent && (comment.parent = parent)
  forward && (comment.forward = forward)
  comment.renderedContent = marked(content)
  comment.author = author

  if (state !== undefined) {
    comment.state = state
  }

  if (type !== undefined) {
    comment.type = type
  }

  if (sticky !== undefined) {
    comment.sticky = sticky
  }

  let data = await new CommentModel(comment).save().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    let p = CommentModel.findById(data._id)
    if (!ctx._isAuthenticated) {
      p = p.select('-content -state -updatedAt')
        .populate({
          path: 'author',
          select: 'github'
        })
        .populate({
          path: 'parent',
          select: 'author meta sticky ups'
        })
        .populate({
          path: 'forward',
          select: 'author meta sticky ups'
        })
    }
    data = await p
      .exec()
      .catch(err => {
        ctx.log.error(err.message)
        return null
      })
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.update = async (ctx, next) => {
  const id = ctx.validateParam('id').required('评论ID参数无效').toString().isObjectId('评论ID参数无效').val()
  const content = ctx.validateBody('content').optional().isString('内容参数必须是字符串类型').val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], '评论状态参数无效').val()
  const sticky = ctx.validateBody('sticky').optional().toInt().isIn([0, 1], '置顶参数无效').val()
  const akimetSpam = ctx.validateBody('akimet_spam').optional().toBoolean().val()
  const comment = {}
  let cache = await CommentModel.findById(id)
    .populate('author')
    .exec()
  if (!cache) {
    return ctx.fail('评论不存在')
  }
  cache = cache.toObject()
  if (ctx._isAuthenticated && ctx._user._id.toString() !== cache.author._id.toString()) {
    return ctx.fail('其他人的评论内容不能修改')
  }

  if (content !== undefined) {
    comment.content = content
    comment.renderedContent = marked(content)
  }

  if (state !== undefined) {
    comment.state = state
  }

  if (sticky !== undefined) {
    comment.sticky = sticky
  }

  if (akimetSpam !== undefined) {
    comment.akimetSpam = akimetSpam
  }

  let p = CommentModel.findByIdAndUpdate(id, comment, { new: true })
  if (!ctx._isAuthenticated) {
    p = p.select('-content -state -updatedAt')
      .populate({
        path: 'author',
        select: 'github'
      })
      .populate({
        path: 'parent',
        select: 'author meta sticky ups'
      })
      .populate({
        path: 'forward',
        select: 'author meta sticky ups'
      })
  }
  const data = await p.exec().catch(err => {
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
  const id = ctx.validateParam('id').required('评论ID参数无效').toString().isObjectId('评论ID参数无效').val()
  const data = await CommentModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail('评论不存在')
  }
}

exports.like = async (ctx, next) => {
  const id = ctx.validateParam('id').required('评论ID参数无效').toString().isObjectId('评论ID参数无效').val()

  const data = await CommentModel.findByIdAndUpdate(id, {
    $inc: {
      ups: 1
    }
  }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success()
  } else {
    ctx.fail('评论不存在')
  }
}

function getPermalink (comment = {}) {
  const { type, article } = comment
  switch (type) {
    case 0:
    return `${config.site}/blog/article/${article}`
      break
    // TODO: 其他页面或组件的permalink
    default:
      break
  }
}

function getCommentType (type) {
  switch (type) {
    case 0:
      return '博客文章评论'
      break
    default:
      return '其他评论'
      break
  }
}
