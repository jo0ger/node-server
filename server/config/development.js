/**
 * @desc 开发环境配置
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const packageInfo = require('../../package.json')

module.exports = {
  mongo: {
    uri: 'mongodb://127.0.0.1/jooger-me-dev'
  },
  sns: {
    github: {
      callbackURL: 'http://127.0.0.1:3001/auth/github/login/callback'
    }
  }
}
