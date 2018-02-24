/**
 * @desc 开发环境配置
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const isDocker = process.env.RUN_ENV === 'docker'

module.exports = {
	mongo: {
		uri: `mongodb://${isDocker ? 'mongo' : '127.0.0.1'}/jooger-me`
	},
	redis: {
		host: isDocker ? 'redis' : '127.0.0.1'
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
