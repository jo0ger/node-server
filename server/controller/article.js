/**
 * @desc Article controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { articleProxy, categoryProxy, tagProxy, userProxy } = require('../proxy')
const { marked, isObjectId, createObjectId, getMonthFromNum, getDocsPaginationData } = require('../util')

// 文章列表
exports.list = async (ctx, next) => {
	const pageSize = ctx.validateQuery('per_page').defaultTo(config.limit.articleLimit).toInt().gt(0, 'per_page参数必须大于0').val()
	const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'page参数必须大于0').val()
	const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
	const category = ctx.validateQuery('category').optional().toString().val()
	const tag = ctx.validateQuery('tag').optional().toString().val()
	const keyword = ctx.validateQuery('keyword').optional().toString().val()
	// 时间区间查询仅后台可用，且依赖于createdAt
	const startDate = ctx.validateQuery('start_date').optional().toString().val()
	const endDate = ctx.validateQuery('end_date').optional().toString().val()
	// 排序仅后台能用，且order和sortBy需同时传入才起作用
	// -1 desc | 1 asc
	const order = ctx.validateQuery('order').optional().toInt().isIn(
		[-1, 1],
		'order参数错误'
	).val()
	// createdAt | updatedAt | publishedAt | meta.ups | meta.pvs | meta.comments
	const sortBy = ctx.validateQuery('sort_by').optional().toString().isIn(
		['createdAt', 'updatedAt', 'publishedAt', 'meta.ups', 'meta.pvs', 'meta.comments'],
		'sort_by参数错误'
	).val()

	// 过滤条件
	const options = {
		sort: {
			createdAt: -1
		},
		page,
		limit: pageSize,
		select: '-content -renderedContent',
		populate: [
			{
				path: 'category',
				select: 'name description extends'
			}, {
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
			{ title: keywordReg }
		]
	}

	// 分类
	if (category) {
		// 如果是id
		if (isObjectId(category)) {
			query.category = category
		} else {
			// 普通字符串，需要先查到id
			const c = await categoryProxy.findOne({ name: category }).exec()
				.catch(err => {
					ctx.log.error(err.message)
					return null
				})
			query.category = c ? c._id : createObjectId()
		}
	}

	// 标签
	if (tag) {
		// 如果是id
		if (isObjectId(tag)) {
			query.tag = tag
		} else {
			// 普通字符串，需要先查到id
			const t = await tagProxy.findOne({ name: tag }).exec()
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

	const articles = await articleProxy.paginate(query, options)

	articles
		? ctx.success(getDocsPaginationData(articles), '文章列表获取成功')
		: ctx.fail('文章列表获取失败')
}

// 热门文章
exports.hot = async (ctx, next) => {
	const limit = ctx.validateQuery('limit').defaultTo(config.limit.hotLimit).toInt().gt(0, 'limit参数必须大于0').val()
	const data = await articleProxy.find()
		.sort('-meta.comments -meta.ups -meta.pvs')
		.select('-content -renderedContent -state')
		.populate([
			{
				path: 'category',
				select: 'name'
			}, {
				path: 'tag',
				select: 'name'
			}
		])
		.limit(limit)
	data
		? ctx.success({ list: data }, '热门文章获取成功')
		: ctx.fail('热门文章获取失败')
}

// 文章详情
exports.item = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少文章ID').toString().isObjectId().val()

	let data = null
	let query = null
	// 只有前台博客访问文章的时候pv才+1
	if (!ctx._isAuthenticated) {
		query = articleProxy.updateOne({ _id: id, state: 1 }, { $inc: { 'meta.pvs': 1 } }).select('-content')
	} else {
		query = articleProxy.getById(id)
	}

	data = await query.populate([
		{
			path: 'category',
			select: 'name description extends'
		}, {
			path: 'tag',
			select: 'name description extends'
		}
	]).exec()

	if (data) {
		data = data.toObject()
		await Promise.all([
			getRelatedArticles(ctx, data),
			getSiblingArticles(ctx, data)
		])
		ctx.success(data, '文章详情获取成功')
	} else {
		ctx.fail('文章详情获取失败')
	}
}

// 文章创建
exports.create = async (ctx, next) => {
	const title = ctx.validateBody('title').required('缺少文章标题').notEmpty().val()
	const content = ctx.validateBody('content').required('缺少文章内容').notEmpty().val()
	const keywords = ctx.validateBody('keywords').optional().toArray().val()
	const category = ctx.validateBody('category').optional().isObjectId().val()
	const tag = ctx.validateBody('tag').optional().isObjectIdArray().val()
	const description = ctx.validateBody('description').optional().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
	const thumb = ctx.validateBody('thumb').optional().val()
	const createdAt = ctx.validateBody('createdAt').optional().toString().val()
	const permalink = ctx.validateBody('permalink').optional().val()
	const article = {}

	title && (article.title = title)
	keywords && (article.keywords = keywords)
	description && (article.description = description)
	category && (article.category = category)
	tag && (article.tag = tag)
	thumb && (article.thumb = thumb)
	createdAt && (article.createdAt = new Date(createdAt))
	permalink && (article.permalink = permalink)

	if (state !== undefined) {
		article.state = state
	}
	article.content = content
	article.renderedContent = marked(content)

	let data = await articleProxy.newAndSave(article)

	if (data && data.length) {
		data = data[0]
		if (!data.permalink) {
			// 更新永久链接
			data = await articleProxy.updateById(data._id, {
				permalink: `${config.site}/article/${data._id}`
			}).exec().catch(err => {
				ctx.log.error('文章永久链接更新失败', err.message)
				return data
			})
		}
		ctx.success(data, '文章创建成功')
	} else {
		ctx.fail('文章创建失败')
	}
}

// 文章更新
exports.update = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少文章ID').toString().isObjectId().val()
	const title = ctx.validateBody('title').optional().val()
	const content = ctx.validateBody('content').optional().val()
	const keywords = ctx.validateBody('keywords').optional().toArray().val()
	const description = ctx.validateBody('description').optional().val()
	const category = ctx.validateBody('category').optional().isObjectId().val()
	const tag = ctx.validateBody('tag').optional().isObjectIdArray().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
	const thumb = ctx.validateBody('thumb').optional().val()
	const createdAt = ctx.validateBody('createdAt').optional().toString().val()
	const article = {}

	title && (article.title = title)
	keywords && (article.keywords = keywords)
	description && (article.description = description)
	category && (article.category = category)
	tag && (article.tag = tag)
	thumb && (article.thumb = thumb)
	createdAt && (article.createdAt = new Date(createdAt))

	if (state !== undefined) {
		article.state = state
	}

	if (content !== undefined) {
		article.content = content
		article.renderedContent = marked(content)
	}

	const data = await articleProxy.updateById(id, article).populate('category tag').exec()

	data
		? ctx.success(data, '文章更新成功')
		: ctx.fail('文章更新失败')
}

// 删除文章
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少文章ID').toString().isObjectId().val()
	const data = await articleProxy.delById(id).exec()

	data && data.result && data.result.ok
		? ctx.success(null, '文章删除成功')
		: ctx.fail('文章删除失败')
}

// 文章点赞
exports.like = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少文章ID').toString().isObjectId().val()
	const like = ctx.validateBody('like').defaultTo(true).toBoolean().val()
	const user = ctx.validateBody('user').optional().isObjectId().val()
	let userCache = null
	if (user) {
		userCache = await userProxy.getById(user).exec().catch(err => {
			ctx.log.error(err.message)
			return null
		})
	}

	let data = null
	if (!userCache || !!userCache.role) {
		data = await articleProxy.likeAndNotify(id, like, userCache)
	} else {
		data = await articleProxy.updateById(id, {
			$inc: {
				'meta.ups': like ? 1 : -1
			}
		}).exec()
	}

	data
		? ctx.success(null, '文章点赞成功')
		: ctx.fail('文章点赞失败')
}

// 文章归档
exports.archives = async (ctx, next) => {
	let data = await articleProxy.aggregate([
		{ $match: { state: 1 } },
		{ $sort: { createdAt: 1 } },
		{
			$project: {
				year: { $year: '$createdAt' },
				month: { $month: '$createdAt' },
				title: 1,
				createdAt: 1
			}
		},
		{
			$group: {
				_id: {
					year: '$year',
					month: '$month'
				},
				articles: {
					$push: {
						title: '$title',
						_id: '$_id',
						createdAt: '$createdAt'
					}
				}
			}
		}
	])

	let count = 0
	if (data && data.length) {
		data = [...new Set(data.map(item => item._id.year))].map(year => {
			const months = []
			data.forEach(item => {
				const { _id, articles } = item
				if (year === _id.year) {
					count += articles.length
					months.push({
						month: _id.month,
						monthStr: getMonthFromNum(_id.month),
						articles
					})
				}
			})
			return {
				year,
				months
			}
		})
	}
	ctx.success({
		count,
		list: data || []
	}, '获取文章归档成功')
}

/**
 * 根据标签获取相关文章
 * @param  {} ctx           koa ctx
 * @param  {} data          文章数据
 */
async function getRelatedArticles (ctx, data) {
	data.related = []
	let { _id, tag = [] } = data
	const articles = await articleProxy.find({
		_id: { $nin: [ _id ] },
		state: 1,
		tag: { $in: tag.map(t => t._id) }
	})
		.select('title thumb createdAt publishedAt meta category')
		.populate({
			path: 'category',
			select: 'name description'
		})
		.exec()
		.catch(err => {
			ctx.log.error('关联文章查询失败，err：', err.message)
			return null
		})

	if (articles) {
		// 最多取前10篇
		data.related = articles.slice(0, config.limit.relatedArticleLimit)
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
		const prev = await articleProxy.findOne(query)
			.select('title createdAt publishedAt thumb category')
			.populate({
				path: 'category',
				select: 'name description'
			})
			.sort('-createdAt')
			.lt('createdAt', data.createdAt)
			.exec()
			.catch(err => {
				ctx.log.error('前一篇文章获取失败，err：', err.message)
				return null
			})
		const next = await articleProxy.findOne(query)
			.select('title createdAt publishedAt thumb category')
			.populate({
				path: 'category',
				select: 'name description'
			})
			.sort('createdAt')
			.gt('createdAt', data.createdAt)
			.exec()
			.catch(err => {
				ctx.log.error('后一篇文章获取失败，err：', err.message)
				return null
			})
		data.adjacent = {
			prev: prev ? prev.toObject() : null,
			next: next ? next.toObject() : null
		}
	}
}
