/**
 * @desc Mongodb connect
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const mongoose = require('mongoose')
const { bhash, getDebug, proxy } = require('../util')
const { UserModel, OptionModel } = require('../model')
const { getGithubUsersInfo } = require('../service')
const debug = getDebug('MongoDB')
let isConnected = false

mongoose.Promise = global.Promise

exports.connect = () => {
	mongoose.connect(config.mongo.uri, config.mongo.option).then(() => {
		debug.success('连接成功')
		isConnected = true
		seed()
	}, err => {
		isConnected = false
		return debug.error('连接失败，错误: ', config.mongo.uri, err.message)
	})
}

exports.seed = seed

function seed () {
	if (isConnected) {
		seedOption()
		seedAdmin()
	}
}

// 参数初始化
async function seedOption () {
	const option = await OptionModel.findOne().exec().catch(err => debug.error(err.message))

	if (!option) {
		await new OptionModel().save().catch(err => debug.error(err.message))
	}
}

// 管理员初始化
async function seedAdmin () {
	const admin = await UserModel.findOne({
		role: config.constant.roleMap.ADMIN,
		'github.login': config.author
	}).exec()
		.catch(err => debug.error('初始化管理员查询失败，错误：', err.message))
	if (!admin) {
		createAdmin()
	}
}

async function createAdmin () {
	let data = await getGithubUsersInfo(config.auth.defaultName)
	if (!data || !data[0]) {
		return fail('未找到Github用户数据')
	}
	data = data[0]
	const result = await new UserModel({
		role: config.constant.roleMap.ADMIN,
		name: data.name,
		email: data.email,
		password: bhash(config.auth.defaultPassword),
		slogan: data.bio,
		site: data.blog || data.url,
		avatar: proxy(data.avatar_url),
		company: data.company,
		location: data.location,
		github: {
			id: data.id,
			login: data.login
		}
	})
		.save()
		.catch(err => fail(err.message))

	if (!result || !result._id) {
		fail('本地入库失败')
	} else {
		debug.success('初始化管理员成功')
	}

	function fail (msg = '') {
		debug.error('初始化管理员失败，错误：', msg)
	}
}
