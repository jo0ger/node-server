/**
 * @desc Akismet
 * @author Jooger <iamjooger@gmail.com>
 * @date 29 Oct 2017
 */

'use strict'

const akismet = require('akismet-api')
const config = require('../config')
const { getDebug } = require('../util')
const debug = getDebug('Akismet')
let akismetClient = null

// Akismet apikey是否验证通过
let isValidKey = false

/**
 * @desc Akismet Client Class
 * @param {String} [required] key       Akismet apikey
 * @param {String} [required] site      Akismet site
 */
class AkismetClient {
	constructor (key, site) {
		this.key = key
		this.site = site
		this.initClient()
	}

	initClient () {
		this.client = akismet.client({
			key: this.key,
			blog: this.site
		})
	}

	async verifyKey () {
		let valid = true
		let error = ''
		if (!isValidKey) {
			await this.client.verifyKey().then(v => {
				valid = v
				if (v) {
					isValidKey = true
				} else {
					error = '无效的Apikey'
					this.client = null
				}
			}).catch(err => {
				error = 'Apikey验证失败，错误：' + err.message
			})
		}
		return { valid, client: this, error }
	}

	// 检测是否是spam
	checkSpam (opt = {}) {
		debug.info('验证评论中...')
		return new Promise((resolve, reject) => {
			if (isValidKey) {
				this.client.checkSpam(opt, (err, spam) => {
					if (err) {
						debug.error('评论验证失败，将跳过Spam验证，错误：', err.message)
						return reject(false)
					}
					if (spam) {
						debug.warn('评论验证不通过，疑似垃圾评论')
						resolve(true)
					} else {
						debug.success('评论验证通过')
						resolve(false)
					}
				})
			} else {
				debug.warn('Apikey未认证，将跳过Spam验证')
				resolve(false)
			}
		})
	}

	// 提交被误检为spam的正常评论
	submitSpam (opt = {}) {
		debug.info('误检Spam垃圾评论报告提交中...')
		return new Promise((resolve, reject) => {
			if (isValidKey) {
				this.client.submitSpam(opt, err => {
					if (err) {
						debug.error('误检Spam垃圾评论报告提交失败')
						return reject(err)
					}
					debug.success('误检Spam垃圾评论报告提交成功')
					resolve()
				})
			} else {
				debug.warn('Apikey未认证，误检Spam垃圾评论报告提交失败')
				resolve()
			}
		})
	}

	// 提交被误检为正常评论的spam
	submitHam (opt = {}) {
		debug.info('误检正常评论报告提交中...')
		return new Promise((resolve, reject) => {
			if (isValidKey) {
				this.client.submitSpam(opt, err => {
					if (err) {
						debug.error('误检正常评论报告提交失败')
						return reject(err)
					}
					debug.success('误检正常评论报告提交成功')
					resolve()
				})
			} else {
				debug.warn('Apikey未认证，误检正常评论报告提交失败')
				resolve()
			}
		})
	}
}

/**
 * @desc 生成Akismet clients
 */
exports.start = async () => {
	const akismetConfig = config.akismet
	const { apiKey } = akismetConfig
	const site = config.site
	const { valid, client, error } = await new AkismetClient(apiKey, site).verifyKey()

	if (valid) {
		debug.success('服务启动成功')
		akismetClient = client
	} else {
		debug.error('服务启动失败', error ? `，${error}` : '')
	}
}

/**
 * @desc 根据站点地址获取对应Akismet client
 * @param  {String} site                    站点地址
 * @return {AkismetClient} akismetClient    Akismet client
 */
exports.getAkismetClient = () => {
	if (!akismetClient) {
		debug.warn('未找到客户端，将跳过spam验证')
		return null
	}
	return akismetClient
}
