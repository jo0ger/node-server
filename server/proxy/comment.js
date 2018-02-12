/**
 * @desc Comment model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { CommentModel } = require('../model')
const notificationProxy = require('./notification')
const config = require('../config')
const { typeMap, categoryMap } = config.constant.notification

class CommentProxy extends BaseProxy {
	constructor () {
		super(CommentModel)
	}

	// 生成通知的创建
	createAndNotify (model) {
		return this.newAndSave(model).then(res => {
			if (res && res.length) {
				notificationProxy.gen({
					type: typeMap.COMMENT,
					category: categoryMap[model.forward ? 'COMMENT_REPLY' : 'COMMENT_COMMENT'],
					comment: res[0]._id
				})
			}
			return res[0]
		})
	}

	likeAndNotify (id, like, user) {
		return this.updateById(id, {
			$inc: {
				ups: like ? 1 : -1
			}
		}).exec().then(res => {
			if (res) {
				const payload = {
					type: typeMap.LIKE,
					category: categoryMap[like ? 'LIKE_COMMENT' : 'UNLIKE_COMMENT'],
					comment: id
				}
				if (user) {
					payload.user = typeof user === 'string' ? user : user._id
				}
				notificationProxy.gen(payload)
			}
			return res
		})
	}
}

module.exports = new CommentProxy()
