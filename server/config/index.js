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
  env: process.env.NODE_ENV,
  root: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 3000,
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
    cookie: {
      name: 'jooger.me'
    },
    secretKey: `${packageInfo.name} ${packageInfo.version}`,
    // token过期时间
    expired: 60 * 60 * 24 * 365,
    defaultName: 'admin',
    defaultPassword: 'admin',
    // 允许请求的域名
    allowedOrigins: [
      'jooger.me',
      'www.jooger.me',
      'blog.jooger.me',
      'admin.jooger.me'
    ]
  }
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
