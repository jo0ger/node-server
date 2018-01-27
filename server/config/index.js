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
  env: process.env.NODE_ENV,
  root: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 3001,
  // 限制参数
  limit: {
    articleLimit: 3,
    // 相关文章限制个数
    relatedArticleLimit: 10,
    hotLimit: 7,
    commentLimit: 20,
    momentLimit: 10,
    // 垃圾评论允许的最大发布次数
    commentSpamLimit: 3,
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
    redisCacheKey: {
      music: 'music-data'
    }
  }
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
