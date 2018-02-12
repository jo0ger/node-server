/**
 * @desc User controlelr
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const config = require('../config')
const { userProxy, commentProxy } = require('../proxy')
const { bhash, bcompare } = require('../util')

// 用户列表
exports.list = async (ctx, next) => {
	let select = '-password'

	if (!ctx._isAuthenticated) {
		select += ' -createdAt -updatedAt -role'
	}

	const data = await userProxy.find()
		.sort('-createdAt')
		.select(select)

	data
		? ctx.success(data, '用户列表获取成功')
		: ctx.fail('用户列表获取失败')
}

// 用户详情
exports.item = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少用户ID').toString().isObjectId().val()
	let select = '-password'

	if (!ctx._isAuthenticated) {
		select += ' -createdAt -updatedAt -github'
	}

	const data = await userProxy.getById(id)
		.select(select)
		.exec()

	data
		? ctx.success(data, '用户详情获取成功')
		: ctx.fail('用户详情获取失败')
}

// 用户更新，只能更新自己
exports.updateMe = async (ctx, next) => {
	const name = ctx.validateBody('name').optional().val()
	const email = ctx.validateBody('email').optional().isEmail('Email格式错误').val()
	const site = ctx.validateBody('site').optional().val()
	const description = ctx.validateBody('description').optional().val()
	const avatar = ctx.validateBody('avatar').optional().val()
	const slogan = ctx.validateBody('slogan').optional().val()
	const company = ctx.validateBody('company').optional().val()
	const location = ctx.validateBody('location').optional().val()
	const user = {}

	name && (user.name = name)
	slogan && (user.slogan = slogan)
	company && (user.company = company)
	location && (user.location = location)
	site && (user.site = site)
	description && (user.description = description)
	avatar && (user.avatar = avatar)
	email && (user.email = email)

	const data = await userProxy.updateById(ctx._user._id, user).exec()
	data
		? ctx.success(data, '用户更新成功')
		: ctx.fail('用户更新失败')
}

// 更新密码
exports.password = async (ctx, next) => {
	const password = ctx.validateBody('password').required('缺少新密码').notEmpty().val()
	const oldPassword = ctx.validateBody('old_password').required('缺少原密码').notEmpty().val()
	const vertifyPassword = bcompare(oldPassword, ctx._user.password)
	if (!vertifyPassword) {
		return ctx.fail('原密码错误')
	}

	const data = await userProxy.updateById(ctx._user._id, {
		password: bhash(password)
	}).exec()
	data
		? ctx.success(data, '密码更新成功')
		: ctx.fail('密码更新失败')
}

// 用户禁言/解禁
exports.mute = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少用户ID').toString().isObjectId().val()
	const mute = ctx.validateBody('mute').defaultTo(true).toBoolean().val()
	const user = userProxy.getById(id).exec()
	if (user && !user.role) {
		return ctx.fail('管理员不能禁言')
	}
	const data = await userProxy.updateById(id, { mute }).exec()
	const msg = mute ? '用户禁言' : '用户解禁'
	data
		? ctx.success(null, `${msg}成功`)
		: ctx.fail(`${msg}失败`)
}

// 博主信息获取
exports.blogger = async (ctx, next) => {
	const data = await userProxy
		.findOne({ 'github.login': config.author, role: 0 })
		.select('-password -role -createdAt -updatedAt -github -mute')
		.exec()

	data
		? ctx.success(data, '博主详情获取成功')
		: ctx.fail('博主详情获取失败')
}

// 站内留言墙的用户，只限站内留言
exports.guests = async (ctx, next) => {
	// OPTIMIZE: $lookup尝试失败，只能循环查询用户了
	let data = await commentProxy.aggregate([
		{
			$match: {
				spam: false, // 非垃圾留言
				state: 1, // 审核通过
				type: 1 // 站内留言
			}
		},
		{
			$sort: {
				createdAt: -1
			}
		},
		{
			$group: {
				_id: '$author'
			}
		}
	]).exec()

	let list = await Promise.all((data || []).map(item => {
		return userProxy.findOne({
			_id: item._id,
			$nor: [
				{
					role: config.constant.roleMap.ADMIN
				}, {
					'github.login': config.author
				}
			]
		}).select('name site avatar').exec()
	}))
	list = list.filter(item => !!item)
	ctx.success({
		list,
		total: list.length
	}, '站内留言用户列表获取成功')
}
