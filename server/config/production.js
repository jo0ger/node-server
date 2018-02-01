/**
 * @desc 开发环境配置
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

module.exports = {
	mongo: {
		uri: 'mongodb://127.0.0.1/jooger-me'
	},
	auth: {
		session: {
			domain: '.jooger.me'
		}
	},
	sns: {
		github: {
			callbackURL: 'https://api.jooger.me/auth/github/login/callback'
		}
	}
}
