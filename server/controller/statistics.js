/**
 * @desc Statistics controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 2 Feb 2018
 */

const { articleProxy, categoryProxy, tagProxy, userProxy, commentProxy } = require('../proxy')

// OPTIMIZE: 站内统计
exports.data = async (ctx, next) => {
	const data = await Promise.all([
		articleProxy.count({ state: 1 }).exec(),
		categoryProxy.count().exec(),
		tagProxy.count().exec(),
		userProxy.count().nor({ role: 0 }).exec(),
		commentProxy.count({ type: 0 }).exec(),
		commentProxy.count({ type: 1 }).exec()
	]).then(([articles, categories, tags, users, comments, guestComments]) => {
		return {
			article: articles,
			category: categories,
			tag: tags,
			user: users,
			comment: comments,
			guestComment: guestComments
		}
	})
	data
		? ctx.success(data, '统计信息获取成功')
		: ctx.fail('统计信息获取失败')
}
