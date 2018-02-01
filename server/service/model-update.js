/**
 * @desc Models update
 * @author Jooger <iamjooger@gmail.com>
 * @date 28 Jan 2018
 */

'use strict'

const config = require('../config')
const { userProxy, optionProxy } = require('../proxy')
const { getGithubUsersInfo } = require('./github-userinfo')
const netease = require('./netease-music')
const { getDebug, proxy } = require('../util')
const debug = getDebug('ModelUpdate')
const isProd = process.env.NODE_ENV === 'production'

// update lock
let updateOptionLock = false
exports.updateOption = async (option = null) => {
	if (updateOptionLock) {
		debug.warn('站点参数更新中...')
		return
	}
	updateOptionLock = true
	if (!option) {
		option = await optionProxy.findOne().exec().catch(err => {
			debug.error('数据查找失败，错误：', err.message)
			return {}
		})
	}

	// 更新友链
	option.links = await generateLinks(option.links)

	const data = await optionProxy.updateOne({}, option).exec().catch(err => {
		debug.error('数据更新失败，错误：', err.message)
		return null
	})

	if (data) {
		debug.success('站点参数更新成功')
	}
	updateOptionLock = false
	return data
}

// 更新github用户信息
exports.updateGithubInfo = async () => {
	const users = await userProxy.find()
		.exec()
		.catch(err => {
			debug.error('用户查找失败，错误：', err.message)
			return []
		})
	const githubUsers = users.reduce((sum, user) => {
		if (user.role === config.constant.roleMap.GITHUB_USER || (user.role === config.constant.roleMap.ADMIN && user.github.login)) {
			sum.push(user)
		}
		return sum
	}, [])
	const updates = await getGithubUsersInfo(githubUsers.map(user => user.github.login))
	Promise.all(
		updates.reduce((tasks, data, index) => {
			if (!data) return tasks
			const user = githubUsers[index]
			const u = {
				name: data.name,
				email: data.email,
				avatar: proxy(data.avatar_url),
				site: data.blog || data.url,
				slogan: data.bio,
				company: data.company,
				location: data.location,
				github: {
					id: data.id,
					login: data.login
				}
			}
			tasks.push(
				userProxy.updateById(user._id, u).exec().catch(err => {
					debug.error('Github用户信息更新失败，错误：', err.message)
					return null
				})
			)
			return tasks
		}, [])
	).then(() => {
		debug.success('Github用户信息全部更新成功')
	}).catch(err => {
		debug.error(err.message)
	})
}

// 获取除了歌曲链接和歌词外其他信息
exports.fetchSonglist = playListId => {
	return netease.neteaseMusic._playlist(playListId).then(({ playlist }) => {
		if (!playlist) {
			return null
		}
		const tracks = playlist.tracks.map(({ name, id, ar, al, dt, tns }) => {
			return {
				id,
				name,
				duration: dt || 0,
				album: al ? {
					name: al.name,
					cover: isProd ? (proxy(al.picUrl) || '') : al.picUrl,
					tns: al.tns
				} : {},
				artists: ar ? ar.map(({ id, name }) => ({ id, name })) : [],
				tns: tns || []
			}
		})
		return {
			id: playListId,
			tracks,
			name: playlist.name,
			description: playlist.description,
			tags: playlist.tags
		}
	}).catch(err => {
		debug.error('歌单列表获取失败，错误：', err.message)
		return null
	})
}

// 更新song list cache
let musicCacheLock = false
exports.updateMusicCache = async function (playListId = '') {
	const { redis } = require('../plugins')
	if (musicCacheLock) {
		debug.warn('缓存更新中...')
		return redis.get(config.constant.redisCacheKey.music) || null
	}
	musicCacheLock = true
	if (!playListId) {
		const option = await optionProxy.findOne().exec().catch(err => {
			debug.error('Option查找失败，错误：', err.message)
			return null
		})

		if (!option || !option.musicId) {
			debug.warn('歌单ID未配置')
			musicCacheLock = false
			return redis.get(config.constant.redisCacheKey.music) || null
		}
		playListId = option.musicId
	}

	const data = await exports.fetchSonglist(playListId)
	if (!data) {
		musicCacheLock = false
		return redis.get(config.constant.redisCacheKey.music) || null
	}
	const set = {
		id: playListId,
		data
	}

	// 设置10分钟过期
	redis.set(config.constant.redisCacheKey.music, set, 60 * 10).then(() => {
		debug.success('缓存更新成功，歌单ID：', playListId)
	}).catch(err => {
		debug.error('缓存更新失败，歌单ID：%s，错误：%s', playListId, err.message)
	})

	musicCacheLock = false
	return set
}

// 更新友链
async function generateLinks (links = []) {
	if (links && links.length) {
		const githubNames = links.map(link => link.github)
		const usersInfo = await getGithubUsersInfo(githubNames)

		if (usersInfo) {
			return links.map((link, index) => {
				const userInfo = usersInfo[index]
				if (userInfo) {
					link.avatar = proxy(userInfo.avatar_url)
					link.slogan = userInfo.bio
					link.site = link.site || userInfo.blog || userInfo.url
				}
				return link
			})
		}
	}
	return links
}
