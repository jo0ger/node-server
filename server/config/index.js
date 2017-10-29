/**
 * @desc Config entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const path = require('path')
const _ = require('lodash')
const packageInfo = require('../../package.json')

const baseConfig = {
  name: packageInfo.name,
  version: packageInfo.version,
  author: packageInfo.author || 'Jooger',
  site: packageInfo.site,
  email: packageInfo.email,
  env: process.env.NODE_ENV,
  root: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 3001,
  codeMap: {
    '-1': 'fail',
    '200': 'success',
    '401': 'authentication failure',
    '403': 'forbidden',
    '500': 'server error',
    '10001': 'params error'
  },
  articleLimit: 15,
  commentLimit: 99,
  commentSpamLimit: 3,
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
    secrets: `${packageInfo.name} ${packageInfo.version}`,
    defaultName: 'jo0ger',
    defaultPassword: 'admin_jooger',
    // 允许请求的域名
    allowedOrigins: [
      'jooger.me',
      'www.jooger.me',
      'blog.jooger.me',
      'admin.jooger.me'
    ]
  },
  sns: {
    github: {
      clientID: process.env.githubClientID || 'github client id',
      clientSecret: process.env.githubClientSecret || 'github client secret',
      callbackURL: 'github oauth callback url'
    }
  },
  akismet: {
    apiKey: process.env.akismetApikey || 'akismet api key'
  }
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
