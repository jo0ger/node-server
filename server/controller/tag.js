/**
 * @desc Tag controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const { tagProxy, articleProxy } = require('../proxy')

// 标签列表
exports.list = async (ctx, next) => {
	const keyword = ctx.validateQuery('keyword').optional().toString().val()

	const query = {}
	// 搜索关键词
	if (keyword) {
		const keywordReg = new RegExp(keyword)
		query.$or = [
			{ name: keywordReg }
		]
	}

	const data = await tagProxy.find(query).sort('-createdAt')

	if (data) {
		for (let i = 0; i < data.length; i++) {
			if (typeof data[i].toObject === 'function') {
				data[i] = data[i].toObject()
			}
			const articles = await articleProxy.find({ tag: data[i]._id, state: 1 }).exec().catch(err => {
				ctx.log.error(err.message)
				return []
			})
			data[i].count = articles.length
		}
		ctx.success(data, '标签列表获取成功')
	} else {
		ctx.fail('标签列表获取失败')
	}
}

// 标签详情
exports.item = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少标签ID').toString().isObjectId().val()

	let data = await tagProxy.getById(id).exec()

	if (data) {
		data = data.toObject()
		const articles = await articleProxy.find({ tag: id })
			.select('-tag')
			.exec()
			.catch(err => {
				ctx.log.error(err.message)
				return []
			})
		data.articles = articles
		data.articles_count = articles.length
		ctx.success(data, '标签详情获取成功')
	} else {
		ctx.fail('标签详情获取失败')
	}
}

// 标签创建
exports.create = async (ctx, next) => {
	const name = ctx.validateBody('name').required('缺少标签名称').notEmpty().val()
	const description = ctx.validateBody('description').optional().val()
	const ext = ctx.validateBody('extends').optional().toArray().val()

	const { length } = await tagProxy.find({ name }).exec().catch(err => {
		ctx.log.error(err.message)
		return []
	})

	if (!length) {
		const data = await tagProxy.newAndSave({
			name,
			description,
			extends: ext
		})

		data && data.length
			? ctx.success(data[0], '标签创建成功')
			: ctx.fail('标签创建失败')
	} else {
		ctx.fail(`【${name}】标签已经存在`)
	}
}

// 标签更新
exports.update = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少标签ID').toString().isObjectId().val()
	const name = ctx.validateBody('name').optional().val()
	const description = ctx.validateBody('description').optional().val()
	const tag = {}

	name && (tag.name = name)
	description && (tag.description = description)

	const data = await tagProxy.updateById(id, tag).exec()

	data
		? ctx.success(data, '标签更新成功')
		: ctx.fail('标签更新失败')
}

// 标签删除
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少标签ID').toString().isObjectId().val()
	const articles = await tagProxy.find({ tag: id }).exec()

	if (articles && articles.length) {
		// 标签下面有文章，不能删除
		ctx.fail('该标签下有文章，不能删除')
	} else {
		const data = await tagProxy.delById(id).exec()
		data && data.result && data.result.ok
			? ctx.success(null, '标签删除成功')
			: ctx.fail('标签删除失败')
	}
}
