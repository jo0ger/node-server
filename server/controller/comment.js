/**
 * @desc Comment controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 28 Oct 2017
 */

'use strict'

const config = require('../config')
const { akismet, mailer } = require('../plugins')
const { commentProxy, userProxy, articleProxy } = require('../proxy')
const { isType, marked, isObjectId, createObjectId, getDebug, getLocation, gravatar, getDocsPaginationData } = require('../util')
const debug = getDebug('Comment')
const isProd = process.env.NODE_ENV === 'development'

// 评论列表
exports.list = async (ctx, next) => {
	const pageSize = ctx.validateQuery('per_page').defaultTo(config.limit.commentLimit).toInt().gt(0, 'per_page参数必须大于0').val()
	const page = ctx.validateQuery('page').defaultTo(1).toInt().gt(0, 'page参数必须大于0').val()
	const state = ctx.validateQuery('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
	const type = ctx.validateQuery('type').optional().toInt().isIn([0, 1], 'type参数错误').val()
	const author = ctx.validateQuery('author').optional().toString().isObjectId().val()
	const article = ctx.validateQuery('article').optional().toString().isObjectId().val()
	const keyword = ctx.validateQuery('keyword').optional().toString().val()
	const parent = ctx.validateQuery('parent').optional().toString().isObjectId().val()
	// 时间区间查询仅后台可用，且依赖于createdAt
	const startDate = ctx.validateQuery('start_date').optional().toString().val()
	const endDate = ctx.validateQuery('end_date').optional().toString().val()
	// 排序仅后台能用，且order和sortBy需同时传入才起作用
	// -1 desc | 1 asc
	const order = ctx.validateQuery('order').optional().toInt().isIn([-1, 1], 'order参数错误').val()
	// createdAt | updatedAt | ups
	const sortBy = ctx.validateQuery('sort_by').optional().toString().isIn(['createdAt', 'updatedAt', 'ups'], 'sort_by参数错误').val()

	// 过滤条件
	const options = {
		sort: { createdAt: 1 },
		page,
		limit: pageSize,
		select: '',
		populate: [
			{
				path: 'author',
				select: !ctx._isAuthenticated ? 'github avatar name site' : ''
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
				},
				populate: {
					path: 'author',
					select: 'avatar github name'
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
			{ content: keywordReg }
		]
	}

	// 用户
	if (author) {
		// 如果是id
		if (isObjectId(author)) {
			query.author = author
		} else {
			// 普通字符串，需要先查到id
			const u = await userProxy.findOne({ name: author }).exec()
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
			const a = await articleProxy.findOne({ name: article }).exec()
				.catch(err => {
					ctx.log.error(err.message)
					return null
				})
			query.article = a ? a._id : createObjectId()
		}
	}

	// 排序
	if (sortBy && order) {
		options.sort = {}
		options.sort[sortBy] = order
	}

	if (parent) {
		// 获取子评论
		query.parent = parent
	} else {
		// 获取父评论
		query.parent = { $exists: false }
	}

	// 未通过权限校验（前台获取评论列表）
	if (!ctx._isAuthenticated) {
		// 将评论状态重置为1
		query.state = 1
		query.spam = false
		// 评论列表不需要content和state
		options.select = '-content -state -updatedAt -spam -type'
	} else {
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

	const comments = await commentProxy.paginate(query, options)

	if (comments) {
		const data = []
		// 查询子评论数量
		await Promise.all(comments.docs.map(doc => {
			doc = doc.toObject()
			doc.subCount = 0
			data.push(doc)
			return commentProxy.count({ parent: doc._id }).exec()
				.then(count => {
					doc.subCount = count
				})
				.catch(err => {
					ctx.log.error(err)
					doc.subCount = 0
				})
		}))
		comments.docs = data
		ctx.success(getDocsPaginationData(comments), '评论列表获取成功')
	} else {
		ctx.fail('评论列表获取失败')
	}
}

// 评论详情
exports.item = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少评论ID').toString().isObjectId().val()

	let data = null
	let queryPs = null
	if (!ctx._isAuthenticated) {
		queryPs = commentProxy.getById(id, { state: 1, spam: false })
			.select('-content -state -updatedAt -type -spam')
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
		queryPs = commentProxy.getById(id)
	}

	data = await queryPs.populate([
		{
			path: 'author',
			select: 'github'
		}, {
			path: 'parent',
			select: 'author meta sticky ups'
		}, {
			path: 'forward',
			select: 'author meta sticky ups'
		}
	]).exec()

	data
		? ctx.success(data.toObject(), '评论详情获取成功')
		: ctx.fail('评论详情获取失败')
}

// 发表评论
exports.create = async (ctx, next) => {
	const content = ctx.validateBody('content').required('缺少评论内容').notEmpty().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([0, 1], 'state参数错误').val()
	const sticky = ctx.validateBody('sticky').optional().toInt().isIn([0, 1], 'sticky参数错误').val()
	const type = ctx.validateBody('type').defaultTo(0).toInt().isIn([0, 1], 'type参数错误').val()
	const article = ctx.validateBody('article').optional().toString().isObjectId('article参数错误').val()
	const parent = ctx.validateBody('parent').optional().toString().isObjectId('parent参数错误').val()
	const forward = ctx.validateBody('forward').optional().toString().isObjectId('forward参数错误').val()
	// ObjectId | { id, name, email, site }
	const author = ctx.validateBody('author').required('author参数错误').val()
	const req = ctx.req
	const comment = { content }

	if (type === undefined || type === 0) {
		if (!article) {
			return ctx.fail('缺少article参数')
		}
		comment.article = article
	}

	if ((parent && !forward) || (!parent && forward)) {
		return ctx.fail('缺少parent和forward参数')
	}

	const user = await checkAuthor.call(ctx, author)
	if (!user) {
		return ctx.fail('作者不存在')
	} else if (user.mute) {
		// 如果被禁言
		return ctx.fail('你已经被禁言')
	}
	comment.author = user._id

	if (!checkUserSpam(user)) {
		return ctx.fail('你的垃圾评论数量已达到最大限制，已被禁言')
	}
	const isAdmin = !user.role

	if (state !== undefined) {
		comment.state = state
	}

	if (type !== undefined) {
		comment.type = type
	}

	if (sticky !== undefined) {
		comment.sticky = sticky
	}

	const { ip, location } = getLocation(req)
	comment.meta = {}
	comment.meta.location = location || null
	comment.meta.ip = ip
	comment.meta.ua = req.headers['user-agent'] || ''
	comment.meta.referer = req.headers.referer || ''

	// 先判断是不是垃圾邮件
	const akismetClient = akismet.getAkismetClient()
	let isSpam = false
	// 永链
	const permalink = getPermalink(comment)
	if (akismetClient) {
		isSpam = await akismetClient.checkSpam({
			user_ip: ip,
			user_agent: comment.meta.ua,
			referrer: comment.meta.referer,
			permalink,
			comment_type: getCommentType(type),
			comment_author: user.name,
			comment_author_email: user.email,
			comment_author_url: user.site,
			comment_content: content,
			is_test: isProd
		})
	}

	// 如果是Spam评论
	if (isSpam) {
		return ctx.fail('检测为垃圾评论，该评论将不会显示')
	}

	parent && (comment.parent = parent)
	forward && (comment.forward = forward)
	comment.renderedContent = marked(content)

	let data = await commentProxy[isAdmin ? 'newAndSave' : 'createAndNotify'](comment)

	if (data) {
		let p = commentProxy.getById(data._id)
		if (!ctx._isAuthenticated) {
			p = p.select('-content -state -updatedAt')
				.populate({
					path: 'author',
					select: 'name site avatar role mute email'
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
		ctx.success(data, '评论创建成功')
		// 如果是文章评论，则更新文章评论数量
		if (type === 0) {
			updateArticleCommentCount([comment.article])
		}
		// 发送邮件通知站主和被评论者
		sendEmailToAdminAndUser(data, permalink)
	} else {
		ctx.fail('评论创建失败')
	}
}

// 评论更新
exports.update = async (ctx, next) => {
	const id = ctx.validateParam('id').required('评论ID参数错误').toString().isObjectId().val()
	const content = ctx.validateBody('content').optional().val()
	const state = ctx.validateBody('state').optional().toInt().isIn([-2, 0, 1, 2], 'state参数错误').val()
	const sticky = ctx.validateBody('sticky').optional().toInt().isIn([0, 1], 'sticky参数错误').val()
	const comment = {}

	let cache = await commentProxy.getById(id)
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

	if (sticky !== undefined) {
		comment.sticky = sticky
	}

	// 状态修改是涉及到spam修改
	if (state !== undefined) {
		comment.state = state
		const akismetClient = akismet.getAkismetClient()
		const permalink = getPermalink(cache)
		const opt = {
			user_ip: cache.meta.ip,
			user_agent: cache.meta.ua,
			referrer: cache.meta.referer,
			permalink,
			comment_type: getCommentType(cache.type),
			comment_author: cache.author.github.login,
			comment_author_email: cache.author.github.email,
			comment_author_url: cache.author.github.blog,
			comment_content: cache.content,
			is_test: isProd
		}

		if (cache.state === -2 && state !== -2) {
			// 垃圾评论转为正常评论
			if (cache.spam) {
				comment.spam = false
				// 报告给Akismet
				akismetClient.submitSpam(opt)
			}
		} else if (cache.state !== -2 && state === -2) {
			// 正常评论转为垃圾评论
			if (!cache.spam) {
				comment.spam = true
				// 报告给Akismet
				akismetClient.submitHam(opt)
			}
		}
	}

	let p = commentProxy.updateById(id, comment)
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
	const data = await p.exec()
	data
		? ctx.success(data, '评论更新成功')
		: ctx.fail('评论更新失败')
}

// 删除评论
exports.delete = async (ctx, next) => {
	const id = ctx.validateParam('id').required('缺少评论ID').toString().isObjectId().val()
	const data = await commentProxy.delById(id).exec()

	data && data.result && data.result.ok
		? ctx.success(null, '评论删除成功')
		: ctx.fail('评论删除失败')
}

// 评论点赞
exports.like = async (ctx, next) => {
	const id = ctx.validateParam('id').required('评论ID参数错误').toString().isObjectId('评论ID参数错误').val()
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
		data = await commentProxy.likeAndNotify(id, like, userCache)
	} else {
		data = await commentProxy.updateById(id, {
			$inc: {
				ups: like ? 1 : -1
			}
		}).exec()
	}

	data
		? ctx.success(null, '评论点赞成功')
		: ctx.fail('评论点赞失败')
}

// 获取永久链接
function getPermalink (comment = {}) {
	const { type, article } = comment
	switch (type) {
	case 0:
		return `${config.site}/blog/article/${article}`
	case 1:
		return `${config.site}/guestbook`
	default:
		return ''
	}
}

// 评论类型说明
function getCommentType (type) {
	switch (type) {
	case 0:
		return '文章评论'
	case 1:
		return '站点留言'
	default:
		return '评论'
	}
}

// 检测用户以往spam评论
async function checkUserSpam (user) {
	const userComments = await commentProxy.find({ author: user._id })
		.exec()
		.catch(err => {
			debug.error('用户历史评论获取失败，错误：', err.message)
			return []
		})

	const spamComments = userComments.filter(c => c.spam)
	// 如果用户以往评论中spam评论数量大于等于spam限制
	if (spamComments.length >= config.limit.commentSpamLimit) {
		if (!user.mute) {
			// 将用户禁言
			await userProxy.muteByIdAndNotify(user._id)
				.then(() => debug.success('用户禁言成功，用户：', user.name))
				.catch(err => debug.error('用户禁言失败，请手动禁言，错误：', err.message))
		}
		return false
	}
	return true
}

// 更新文章的meta.comments评论数量
async function updateArticleCommentCount (articleIds = []) {
	if (!articleIds.length) {
		return
	}
	// TIP: 这里必须$in的是一个ObjectId对象数组，而不能只是id字符串数组
	articleIds = [...new Set(articleIds)].filter(id => isObjectId(id)).map(id => createObjectId(id))
	const counts = await commentProxy.aggregate([
		{ $match: { state: 1, article: { $in: articleIds } } },
		{ $group: { _id: '$article', total_count: { $sum: 1 } } }
	])
		.exec()
		.catch(err => {
			debug.error('更新文章评论数量前聚合评论数据操作失败，错误：', err.message)
			return []
		})
	Promise.all(
		counts.map(count => articleProxy.updateById(count._id, { $set: { 'meta.comments': count.total_count } }).exec())
	)
		.then(() => debug.success('文章评论数量更新成功'))
		.catch(err => debug.error('文章评论数量更新失败，错误：', err.message))
}

// 发送邮件
async function sendEmailToAdminAndUser (comment, permalink) {
	const { type, article } = comment
	let adminTitle = '位置的评论'
	let adminType = '评论'
	if (type === 0) {
		// 文章评论
		const at = await articleProxy.getById(article).exec().catch(() => null)
		if (at && at._id) {
			adminTitle = `博客文章 [${at.title}] 有了新的评论`
		}
		adminType = '评论'
	} else if (type === 1) {
		// 站内留言
		adminTitle = `个人站点有新的留言`
		adminType = '留言'
	}

	// 发送给管理员邮箱config.email
	mailer.send({
		subject: adminTitle,
		text: `来自 ${comment.author.github.name} 的${adminType}：${comment.content}`,
		html: `<p>来自 <a href="${comment.author.github.blog || 'javascript:;'}" target="_blank">${comment.author.github.name}</a> 的${adminType} <a href="${permalink}" target="_blank">[ 点击查看 ]</a>：${comment.renderedContent}</p>`
	}, true)

	// 发送给被评论者
	if (comment.forward) {
		const forwardAuthor = await userProxy.getById(comment.forward.author).exec().catch(() => null)
		if (forwardAuthor) {
			mailer.send({
				to: forwardAuthor.github.email,
				subject: '你在 Jooger 的博客的评论有了新的回复',
				text: `来自 ${comment.author.name} 的回复：${comment.content}`,
				html: `<p>来自 <a href="${comment.author.github.blog || 'javascript:;'}" target="_blank">${comment.author.name}</a> 的回复 <a href="${permalink}" target="_blank">[ 点击查看 ]</a>：${comment.renderedContent}</p>`
			})
		} else {
			debug.warn('给被评论者邮件失败')
		}
	}
}

// 验证作者
async function checkAuthor (author) {
	let user = null
	if (isObjectId(author)) {
		user = await findUser({
			_id: author
		})
	} else if (isType(author, 'Object')) {
		// 需要创建或更新用户
		const update = {}
		author.name && (update.name = author.name)
		author.site && (update.site = author.site)
		if (author.email) {
			update.avatar = gravatar(author.email)
			update.email = author.email
		}
		if (author.id) {
			// 更新
			if (isObjectId(author.id)) {
				user = await userProxy.updateByIdAndNotify(author.id, update)
					.catch(err => {
						debug.error('用户更新失败，错误：', err.message)
						this.log.error(err.message)
						return null
					})
				if (user) {
					debug.success(`用户【${user.name}】更新成功`)
				}
			}
		} else {
			// 创建
			user = await userProxy.createAndNotify({
				...update,
				role: config.constant.roleMap.USER
			}).catch(err => {
				debug.error('用户创建失败，错误：', err.message)
				this.log.error(err.message)
				return null
			})
			if (user) {
				debug.success(`用户【${user.name}】创建成功`)
			}
		}
	}
	return user
}

async function findUser (query = {}, update) {
	const user = await userProxy.findOne(query).select('-password').exec().catch(err => {
		debug.error('用户查找失败，错误：', err.message)
		return null
	})
	return user
}
