/**
 * @desc Util entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const validator = require('validator')
const config = require('../config')

exports.getDebug = require('./debug')

exports.signToken = require('./sign-token')

exports.marked = require('./marked')

exports.encrypt = require('./encrypt')

exports.proxy = require('./proxy')

exports.getLocation = require('./location')

exports.gravatar = require('./gravatar')

exports.noop = function () {}

exports.isType = (obj = {}, type = 'Object') => {
	if (!Array.isArray(type)) {
		type = [type]
	}
	return type.some(t => {
		if (typeof t !== 'string') {
			return false
		}
		return Object.prototype.toString.call(obj) === `[object ${t}]`
	})
}

exports.createObjectId = (id = '') => {
	return id ? mongoose.Types.ObjectId(id) : mongoose.Types.ObjectId()
}

exports.isObjectId = (str = '') => mongoose.Types.ObjectId.isValid(str)

// 首字母大写
exports.firstUpperCase = (str = '') => str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase())

// hash 加密
exports.bhash = (str = '') => bcrypt.hashSync(str, 8)

// 对比
exports.bcompare = (str, hash) => bcrypt.compareSync(str, hash)

// 随机字符串
exports.randomString = (length = 8) => {
	const chars = `ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz`
	let id = ''
	for (let i = 0; i < length; i++) {
		id += chars[Math.floor(Math.random() * chars.length)]
	}
	return id
}

exports.getMonthFromNum = (num = 1) => config.constant.monthMap[num - 1] || ''

Object.keys(validator).forEach(key => {
	exports[key] = function () {
		return validator[key].apply(validator, arguments)
	}
})

exports.isSiteUrl = (site = '') => validator.isURL(site, {
	protocols: ['http', 'https'],
	require_protocol: true
})

// 获取分页请求的响应数据
exports.getDocsPaginationData = (docs = {}) => {
	return {
		list: docs.docs,
		pagination: {
			total: docs.total,
			current_page: docs.page > docs.pages ? docs.pages : docs.page,
			total_page: docs.pages,
			per_page: docs.limit
		}
	}
}
