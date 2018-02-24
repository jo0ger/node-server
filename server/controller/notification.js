/**
 * @desc Notification controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 12 Feb 2018
 */

'use strict'

const config = require('../config')
const { notificationProxy } = require('../proxy')
const { getDocsPaginationData } = require('../util')
const { typeMap, categoryMap } = config.constant.notification

// 通知列表
exports.list = async (ctx, next) => {
	const pageSize = ctx.validateQuery('per_page').defaultTo(20).toInt().gt(0, 'per_page参数必须大于0').val()
	const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'page参数必须大于0').val()
	const type = ctx.validateQuery('type').optional().toInt().isIn(Object.values(typeMap), 'type参数错误').val()
	const category = ctx.validateQuery('category').optional().toInt().isIn(Object.values(categoryMap), 'category参数错误').val()
	const viewed = ctx.validateQuery('viewed').optional().toString().val()

	// 过滤条件
	const options = {
		sort: {
			createdAt: -1
		},
		page,
		limit: pageSize,
		populate: [
			{
				path: 'user',
				select: 'name email site'
			},
			{
				path: 'article',
				select: 'title permalink'
			}
		]
	}

	// 查询条件
	const query = {}

	if (type !== undefined) {
		query.type = type
	}

	if (category !== undefined) {
		query.category = category
	}

	if (viewed !== undefined) {
		query.viewed = viewed === 'true'
	}

	const ns = await notificationProxy.paginate(query, options)

	ns
		? ctx.success(getDocsPaginationData(ns), '通知列表获取成功')
		: ctx.fail('通知列表获取失败')
}

// 未读通知数量
exports.count = async (ctx, next) => {
	const data = await notificationProxy.count({ viewed: false }).exec()

	data
		? ctx.success(data, '未读通知数量获取成功')
		: ctx.fail('未读通知数量获取失败')
}

// 通知已读
exports.view = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少通知ID').toString().isObjectId().val()
	const data = await notificationProxy.updateById(id, {
		viewed: true
	}).exec()

	data
		? ctx.success(null, '通知标记已读成功')
		: ctx.fail('通知标记已读失败')
}

// 通知已读
exports.viewAll = async (ctx, next) => {
	const data = await notificationProxy.updateMany({ viewed: false }, { viewed: true }).exec()
	data && data.ok
		? ctx.success(null, '通知全部标记已读成功')
		: ctx.fail('通知全部标记已读失败')
}

// 删除通知
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少通知ID').toString().isObjectId().val()
	const data = await notificationProxy.delById(id).exec()

	data && data.result && data.result.ok
		? ctx.success(null, '通知删除成功')
		: ctx.fail('通知删除失败')
}
