/**
 * @desc gravatar头像
 * @author Jooger <iamjooger@gmail.com>
 * @date 6 Jan 2018
 */

'use strict'

const gravatar = require('gravatar')
const config = require('../config')
const isProd = process.env.NODE_ENV === 'production'

module.exports = (email = '', opt = {}) => {
	if (!/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(email)) {
		return config.auth.defaultAvatar
	}

	const protocol = `http${isProd ? 's' : ''}`
	const url = gravatar.url(email, {
		s: '100',
		r: 'x',
		d: 'retro',
		protocol,
		...opt
	})

	return url.replace(`${protocol}://`, 'https://jooger.me/proxy/')
}
