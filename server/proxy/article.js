/**
 * @desc Article model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { ArticleModel } = require('../model')
const notificationProxy = require('./notification')
const config = require('../config')
const { typeMap, categoryMap } = config.constant.notification

class ArticleProxy extends BaseProxy {
	constructor () {
		super(ArticleModel)
	}

	likeAndNotify (id, like, user) {
		return this.updateById(id, {
			$inc: {
				'meta.ups': like ? 1 : -1
			}
		}).exec().then(res => {
			if (res) {
				const payload = {
					type: typeMap.LIKE,
					category: categoryMap[like ? 'LIKE_ARTICLE' : 'UNLIKE_ARTICLE'],
					article: id
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

module.exports = new ArticleProxy()
