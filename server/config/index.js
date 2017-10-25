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
  site: 'https://jooger.me',
  env: process.env.NODE_ENV,
  root: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 3001,
  pageSize: 15,
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
      key: 'jooger.me.token',
      maxAge: 60000 * 60 * 24 * 7,
      signed: false
    },
    secrets: `${packageInfo.name} ${packageInfo.version}`,
    defaultName: 'Jooger',
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
      clientID: 'github client id',
      clientSecret: 'github client secret',
      callbackURL: 'github oauth callback url'
    }
  }
}

module.exports = _.merge(baseConfig, require(`./${process.env.NODE_ENV}`))
