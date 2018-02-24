/**
 * @desc Config entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const path = require('path')
const _ = require('lodash')
const packageInfo = require('../../package.json')

const baseConfig = {
	name: packageInfo.name,
	version: packageInfo.version,
	author: packageInfo.author.name,
	site: packageInfo.author.url,
	email: packageInfo.author.email,
	email_163: 'zzy1198258955@163.com',
	env: process.env.NODE_ENV,
	root: path.resolve(__dirname, '../../'),
	port: process.env.PORT || 3001,
	// 限制参数
	limit: {
		articleLimit: 15,
		// 相关文章限制个数
		relatedArticleLimit: 10,
		hotLimit: 7,
		commentLimit: 20,
		momentLimit: 10,
		// 垃圾评论允许的最大发布次数
		commentSpamLimit: 3
	},
	mongo: {
		option: {
			useMongoClient: true,
			poolSize: 20,
			keepAlive: true,
			autoReconnect: true,
			reconnectInterval: 1000,
			reconnectTries: Number.MAX_VALUE
		}
	},
	redis: {
		host: '127.0.0.1',
		port: 6379
	},
	auth: {
		session: {
			key: 'jooger.me.token',
			maxAge: 60000 * 60 * 24 * 7,
			signed: false
		},
		userCookieKey: 'jooger.me.userid',
		secrets: `${packageInfo.name}-secrets`,
		defaultAvatar: 'http://static.jooger.me/img/common/default-avatar.png',
		// 初始化管理员，默认github账户名
		defaultName: packageInfo.author.name,
		defaultPassword: 'admin_jooger'
	},
	sns: {
		github: {
			// 登陆后的token的cookie名，每个第三方登录方式必备项
			key: 'jooger.me.github.token',
			clientID: process.env.githubClientID || 'github client id',
			clientSecret: process.env.githubClientSecret || 'github client secret',
			callbackURL: 'github oauth callback url'
		}
	},
	akismet: {
		apiKey: process.env.akismetApikey || 'akismet api key'
	},
	aliyun: {
		oss: {
			accessKeyId: process.env.aliyunOssAccessKeyId || 'alayu accesskey Id',
			accessKeySecret: process.env.aliyunOssAccessKeySecret || 'aliyun oss accesskey secret',
			bucket: 'jooger-static',
			region: 'oss-cn-beijing'
		}
	},
	constant: {
		// 允许请求的域名
		allowedOrigins: [
			'jooger.me',
			'www.jooger.me',
			'admin.jooger.me'
		],
		codeMap: {
			'-1': '请求失败',
			'200': '请求成功',
			'401': '权限校验失败',
			'403': 'Forbidden',
			'500': '服务器错误',
			'10001': '参数错误'
		},
		// 角色
		roleMap: {
			ADMIN: 0,
			USER: 1,
			GITHUB_USER: 2
		},
		monthMap: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
		// 站内通知
		notification: {
			typeMap: {
				GENERAL: 0,
				COMMENT: 1,
				LIKE: 2,
				USER: 3
			},
			categoryMap: {
				// type === 0，系统通知
				MUTE_USER: 'mute-user', // 用户禁言
				// type === 1，评论通知
				COMMENT_COMMENT: 'comment-comment', // 评论（非回复）
				COMMENT_REPLY: 'comment-reply',	// 评论回复
				COMMENT_UPDATE: 'comment-update', // 评论更新
				// type === 2，点赞通知
				LIKE_ARTICLE: 'like-article', // 文章点赞
				UNLIKE_ARTICLE: 'unlike-article', // 文章取消点赞
				LIKE_COMMENT: 'like-comment', // 评论点赞
				UNLIKE_COMMENT: 'unlike-comment', // 评论取消点赞
				// type === 3, 用户操作通知
				USER_CREATE: 'user-create', // 用户创建
				USER_UPDATE: 'user-update' // 用户更新
			}
		},
		redisCacheKey: {
			music: 'music-data'
		}
	}
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
