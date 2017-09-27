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
  env: process.env.NODE_ENV,
  root: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 3001,
  pageSize: 12,
  codeMap: {
    '-1': 'fail',
    '200': 'success',
    '401': 'authentication failure',
    '403': 'forbidden',
    '500': 'server error',
    '10001': 'params error'
  },
  mongo: {
    option: {
      useMongoClient: true,
      poolSize: 20
    }
  },
  // TODO: Redis
  redis: {},
  auth: {
    session: {
      key: 'jooger.me.sid',
      maxAge: 60000 * 60 * 24 * 7,
      signed: false
    },
    secrets: `${packageInfo.name} ${packageInfo.version}`,
    defaultName: 'admin',
    defaultPassword: 'admin',
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
      clientID: process.env.GITHUB_CLIENT_ID || '5b4d4a7945347d0fd2e2',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '8771bd9ae52749cc15b0c9e2c6cb4ecd7f39d9da',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://127.0.0.1:3001/api/auth/github/login/callback'
    }
  }
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
