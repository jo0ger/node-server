/**
 * @desc Moment controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 30 Oct 2017
 */

'use strict'

const config = require('../config')
const { MomentModel } = require('../model')
const { getDebug, getLocation } = require('../util')
const debug = getDebug('Moment')

exports.list = async (ctx, next) => {
  const pageSize = ctx.validateQuery('per_page').defaultTo(config.momentLimit).toInt().gt(0, '每页数量必须大于0').val()
  const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, '页码参数必须大于0').val()
  const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], '个人动态状态参数无效').val()
  const keyword = ctx.validateQuery('keyword').optional().toString().val()

  const query = {}
  const options = {
    page,
    limit: pageSize,
    sort: { createdAt: -1 }
  }

  if (!ctx._isAuthenticated) {
    query.state = 1
  } else {
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
  }
  
  const moments = await MomentModel.paginate(query, options).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (moments) {
    ctx.success({
      list: moments.docs,
      pagination: {
        total: moments.total,
        current_page: moments.page > moments.pages ? moments.pages : moments.page,
        total_page: moments.pages,
        per_page: moments.limit
      }
    })
  } else {
    ctx.fail(-1)
  }
}

exports.create = async (ctx, next) => {
  const content = ctx.validateBody('content')
    .required('内容参数必填')
    .notEmpty()
    .isString('内容参数必须是字符串类型')
    .val()
  const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], '个人动态状态参数无效').val()
  const req = ctx.req
  const moment = {}
  const { ip, location } = getLocation(req)
  
  if (state !== undefined) {
    moment.state = state
  }
  moment.location = { ip, ...location }
  moment.content = content

  const data = await new MomentModel(moment).save().catch(err => {
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
  const id = ctx.validateParam('id').required('个人动态ID参数无效').toString().isObjectId('个人动态ID参数无效').val()
  const content = ctx.validateBody('content').optional().isString('内容参数必须是字符串类型').val()
  const state = ctx.validateBody('state').optional().toInt().isIn([-2, 0, 1, 2], '个人动态状态参数无效').val()
  const req = ctx.req
  const moment = {}

  if (state !== undefined) {
    moment.state = state
  }
  content && (moment.content = content)

  const data = await MomentModel.findByIdAndUpdate(id, moment, {
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
  const id = ctx.validateParam('id').required('个人动态ID参数无效').toString().isObjectId('个人动态ID参数无效').val()
  const data = await MomentModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail()
  }
}


