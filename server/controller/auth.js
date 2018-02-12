/**
 * @desc Auth controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Sep 2017
 */

'use strict'

const config = require('../config')
const { userProxy } = require('../proxy')
const { bcompare, getDebug, signToken, proxy, randomString } = require('../util')
const { getGithubToken, getGithubAuthUserInfo } = require('../service')
const debug = getDebug('Auth')

exports.localLogin = async (ctx, next) => {
	const name = ctx.validateBody('name').required('缺少登录名').notEmpty().val()
	const password = ctx.validateBody('password').required('缺少密码').notEmpty().val()

	const user = await userProxy.findOne({ name }).exec()

	if (user) {
		const vertifyPassword = bcompare(password, user.password)
		if (vertifyPassword) {
			const { session } = config.auth
			const token = signToken({
				id: user._id,
				name: user.name
			})
			ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
			ctx.cookies.set(config.auth.userCookieKey, user._id, { signed: false, domain: session.domain, maxAge: session.maxAge, httpOnly: false })
			debug.success('登录成功, 用户ID：%s，用户名：%s', user._id, user.name)
			ctx.success({
				id: user._id,
				token
			}, '登录成功')
		} else {
			ctx.fail('密码错误')
		}
	} else {
		ctx.fail('用户不存在')
	}
}

exports.logout = async (ctx, next) => {
	const { session } = config.auth
	const token = signToken({
		id: ctx._user._id,
		name: ctx._user.name
	}, false)
	ctx.cookies.set(session.key, token, { signed: false, domain: session.domain, maxAge: 0, httpOnly: false })
	ctx.cookies.set(config.auth.userCookieKey, ctx._user._id, { signed: false, domain: session.domain, maxAge: 0, httpOnly: false })
	debug.success('登出成功, 用户ID：%s，用户名：%s', ctx.user._id, ctx.user.name)
	ctx.success(null, '登出成功')
}

exports.info = async (ctx, next) => {
	const adminId = ctx._user._id
	if (!adminId && !ctx._isSnsAuthenticated && !ctx._isAuthenticated) {
		return ctx.fail(401)
	}
	let data = null
	if (ctx._isSnsAuthenticated) {
		// TODO: 第三方信息获取
	} else if (ctx._isAuthenticated) {
		data = await userProxy.getById(adminId)
			.select('-password')
			.exec()
			.catch(err => {
				ctx.log.error(err.message)
				return null
			})
	}

	if (data) {
		ctx.success({
			info: data,
			token: ctx.session._token
		})
	} else {
		ctx.fail(401)
	}
}

exports.fetchGithubToken = async (ctx, next) => {
	const code = ctx.validateQuery('code').required('缺少code参数').toString().val()
	const token = await getGithubToken(code)
	if (token) {
		ctx.success(token)
	} else {
		ctx.fail('Token获取失败')
	}
}

exports.fetchGithubUser = async (ctx, next) => {
	const accessToken = ctx.validateQuery('access_token').required('缺少access_token参数').toString().val()
	const data = await getGithubAuthUserInfo(accessToken)
	if (!data) {
		return ctx.fail('用户信息获取失败')
	}
	const user = await createLocalUserFromGithub(data)
	if (user) {
		ctx.success(user)
	} else {
		ctx.fail('用户信息获取失败')
	}
}

async function createLocalUserFromGithub (githubUser) {
	const user = await userProxy.findOne({
		'github.id': githubUser.id
	}).catch(err => {
		debug.error('本地用户查找失败, 错误：', err.message)
		return null
	})
	if (user) {
		const userData = {
			name: githubUser.name || githubUser.login,
			avatar: proxy(githubUser.avatar_url),
			slogan: githubUser.bio,
			github: githubUser,
			role: user.role
		}
		const updatedUser = await userProxy.updateById(user._id, userData)
			.select('-password -role -createdAt -updatedAt')
			.exec().catch(err => {
				debug.error('本地用户更新失败, 错误：', err.message)
			}) || user

		return updatedUser.toObject()
	} else {
		const newUser = {
			name: githubUser.name || githubUser.login,
			avatar: proxy(githubUser.avatar_url),
			slogan: githubUser.bio,
			github: githubUser,
			role: 1
		}

		const checkUser = await userProxy.findOne({ name: newUser.name }).exec().catch(err => {
			debug.error('本地用户查找失败, 错误：', err.message)
			return true
		})

		if (checkUser) {
			newUser.name += '-' + randomString()
		}

		const data = await userProxy.createAndNotify(newUser).catch(err => {
			debug.error('本地用户创建失败, 错误：', err.message)
			return null
		})

		return data && data.length ? data[0].toObject() : null
	}
}
