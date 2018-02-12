/**
 * @desc Notification model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { NotificationModel } = require('../model')
const config = require('../config')
const { getDebug } = require('../util')
const debug = getDebug('Notification')
const { typeMap, categoryMap } = config.constant.notification

class NotificationProxy extends BaseProxy {
	constructor () {
		super(NotificationModel)
	}

	// 生成站内消息
	gen (model) {
		return this.newAndSave(model).then(res => {
			if (res && res.length) {
				debug('通知生成成功，', `类型[${getKeyByValue(typeMap, model.type)}]，分类[${getKeyByValue(categoryMap, model.category)}]，ID[${res[0]._id}]`)
			}
			return res
		}).catch(err => {
			debug.error('通知生成失败，错误：', err.message)
			return null
		})
	}
}

function getKeyByValue (obj, val) {
	return Object.keys(obj).find(key => val === obj[key])
}

module.exports = new NotificationProxy()
