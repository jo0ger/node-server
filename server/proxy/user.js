/**
 * @desc User model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { UserModel } = require('../model')
const notificationProxy = require('./notification')
const config = require('../config')
const { typeMap, categoryMap } = config.constant.notification

class UserProxy extends BaseProxy {
	constructor () {
		super(UserModel)
	}

	// 生成通知的创建
	createAndNotify (model) {
		return this.newAndSave(model).then(res => {
			if (res && res.length && !!res[0].role) {
				// 管理员不生成通知
				notify(typeMap.USER, categoryMap.USER_CREATE, res[0]._id)
			}
			return res[0]
		})
	}

	// 生成通知的更新
	updateByIdAndNotify (id, doc, opt = {}) {
		return this.updateById(...arguments).exec().then(res => {
			if (res && !!res.role) {
				// 管理员不生成通知
				notify(typeMap.USER, categoryMap.USER_UPDATE, id)
			}
			return res
		})
	}

	muteByIdAndNotify (id) {
		return this.updateById(id, { mute: true }).exec().then(res => {
			if (res && !!res.role) {
				// 管理员不生成通知
				notify(typeMap.GENERAL, categoryMap.USER_UPDATE, id)
			}
			return res
		})
	}
}

function notify (type, category, user) {
	if (!type || !category || !user) {
		return
	}
	notificationProxy.gen({
		type,
		category,
		user
	})
}

module.exports = new UserProxy()
