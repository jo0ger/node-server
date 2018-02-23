/**
 * @desc Category controll
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Oct 2017
 */

'use strict'

const { articleProxy, categoryProxy } = require('../proxy')

// 分类列表
exports.list = async (ctx, next) => {
	const keyword = ctx.validateQuery('keyword').optional().toString().val()
	// 是否按照list属性排序
	const rank = ctx.validateQuery('rank').defaultTo(1).toInt().isIn([0, 1], 'rank参数错误').val()

	const query = {}
	// 搜索关键词
	if (keyword) {
		const keywordReg = new RegExp(keyword)
		query.$or = [
			{ name: keywordReg }
		]
	}

	let sort = '-createdAt'
	if (rank) {
		sort = 'list ' + sort
	}

	const data = await categoryProxy.find(query).sort(sort)

	if (data) {
		for (let i = 0; i < data.length; i++) {
			if (typeof data[i].toObject === 'function') {
				data[i] = data[i].toObject()
			}
			const articles = await articleProxy.find({ category: data[i]._id }).exec().catch(err => {
				ctx.log.error(err.message)
				return []
			})
			data[i].count = articles.length
		}
		ctx.success(data, '分类列表获取成功')
	} else {
		ctx.fail('分类列表获取失败')
	}
}

// 分类详情
exports.item = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少分类ID').toString().isObjectId().val()

	let data = await categoryProxy.getById(id).exec()

	if (data) {
		data = data.toObject()
		const articles = await articleProxy.find({ category: id })
			.select('-category')
			.exec()
			.catch(err => {
				ctx.log.error(err.message)
				return []
			})
		data.articles = articles
		data.articles_count = articles.length
		ctx.success(data, '分类详情获取成功')
	} else {
		ctx.fail('分类详情获取失败')
	}
}

// 分类创建
exports.create = async (ctx, next) => {
	const name = ctx.validateBody('name').required('缺少分类名称').notEmpty().val()
	const description = ctx.validateBody('description').optional().val()
	const list = ctx.validateBody('list').defaultTo(1).toInt().val()
	const ext = ctx.validateBody('extends').optional().toArray().val()

	const { length } = await categoryProxy.find({ name }).exec().catch(err => {
		ctx.log.error(err.message)
		return []
	})

	if (!length) {
		const data = await categoryProxy.newAndSave({
			name,
			description,
			extends: ext,
			list
		})

		data && data.length
			? ctx.success(data[0], '分类创建成功')
			: ctx.fail('分类创建失败')
	} else {
		ctx.fail(`【${name}】分类已经存在`)
	}
}

// 分类更新
exports.update = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少分类ID').toString().isObjectId().val()
	const name = ctx.validateBody('name').optional().val()
	const description = ctx.validateBody('description').optional().val()
	const list = ctx.validateBody('list').optional().toInt().val()
	const category = {}

	name && (category.name = name)
	description && (category.description = description)
	list && (category.list = list)

	const data = await categoryProxy.updateById(id, category).exec()

	data
		? ctx.success(data, '分类更新成功')
		: ctx.fail('分类更新失败')
}

// 删除分类
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少分类ID').toString().isObjectId().val()
	const articles = await articleProxy.find({ category: id }).exec()

	if (articles && articles.length) {
		// 分类下面有文章，不能删除
		ctx.fail('该分类下有文章，不能删除')
	} else {
		const data = await categoryProxy.delById(id).exec()
		data && data.result && data.result.ok
			? ctx.success(null, '分类删除成功')
			: ctx.fail('分类删除失败')
	}
}
