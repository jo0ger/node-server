/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('./config')

module.exports = function () {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongo.uri, config.mongo.option, err => {
    if (err) {
      console.error('connect to %s error: ', config.mongo.uri, err.message)
      process.exit(0)
    }
  })
}
