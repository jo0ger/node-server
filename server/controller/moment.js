/**
 * @desc Moment controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 30 Oct 2017
 */

'use strict'

const config = require('../config')
const { momentProxy } = require('../proxy')
const { getLocation, getDocsPaginationData } = require('../util')

// 动态列表
exports.list = async (ctx, next) => {
	const pageSize = ctx.validateQuery('per_page').defaultTo(config.limit.momentLimit).toInt().gt(0, '每页数量必须大于0').val()
	const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, '页码参数必须大于0').val()
	const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
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
				{ content: keywordReg }
			]
		}
	}

	const moments = await momentProxy.paginate(query, options)

	moments
		? ctx.success(getDocsPaginationData(moments), '动态列表获取成功')
		: ctx.fail('动态列表获取失败')
}

// 创建动态
exports.create = async (ctx, next) => {
	const content = ctx.validateBody('content').required('缺少内容').notEmpty().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'state参数无效').val()
	const req = ctx.req
	const moment = {}
	const { ip, location } = getLocation(req)

	if (state !== undefined) {
		moment.state = state
	}
	moment.location = { ip, ...location }
	moment.content = content

	const data = await momentProxy.newAndSave(moment)

	data && data.length
		? ctx.success(data, '动态创建成功')
		: ctx.fail('动态创建失败')
}

// 动态更新
exports.update = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少动态ID').toString().isObjectId().val()
	const content = ctx.validateBody('content').optional().toString().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'state参数无效').val()
	const moment = {}

	if (state !== undefined) {
		moment.state = state
	}
	content && (moment.content = content)
	const data = await momentProxy.updateById(id, moment).exec()

	data
		? ctx.success(data, '动态更新成功')
		: ctx.fail('动态更新失败')
}

// 删除动态
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少动态ID').toString().isObjectId().val()
	const data = await momentProxy.delById(id).exec()

	data && data.result && data.result.ok
		? ctx.success(null, '动态删除成功')
		: ctx.fail('动态删除失败')
}
