/**
 * @desc Notification
 * @author Jooger <iamjooger@gmail.com>
 * @date 12 Feb 2018
 */

'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')
const config = require('../../config')

const notificationSchema = new mongoose.Schema({
	// 通知类型 0 系统通知 | 1 评论通知 | 2 点赞通知 | 3 用户操作通知
	type: { type: Number, required: true, validate: typeValidator },
	// 类型细化分类
	category: { type: String, required: true, validate: categoryValidator },
	// 是否已读
	viewed: { type: Boolean, default: false },
	// article user comment 根据情况是否包含
	article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
	// 必填
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
})

function typeValidator (val) {
	return Object.values(config.constant.notification.typeMap).includes(+val)
}

function categoryValidator (val) {
	return Object.values(config.constant.notification.categoryMap).includes(val + '')
}

notificationSchema.plugin(mongoosePaginate)

module.exports = notificationSchema
