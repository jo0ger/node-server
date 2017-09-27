/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('./config')
const { UserModel, OptionModel } = require('./model')
const { bhash, setDebug } = require('./util')
const debug = setDebug('mongo:connect')

module.exports = function () {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongo.uri, config.mongo.option, err => {
    if (err) {
      debug.error('connect to %s error: ', config.mongo.uri, err.message)
      process.exit(0)
    }
  })

  seedOption()
  seedAdmin()
}

function seedOption () {
  OptionModel.findOne().exec().then(data => {
    if (!data) {
      createOption()
    }
  })

  function createOption () {
    new OptionModel().save().catch(err => debug.error(err.message))
  }
}

function seedAdmin () {
  UserModel.findOne({ role: 0 }).exec().then(data => {
    if (!data) {
      createAdmin()
    }
  })
  
  function createAdmin () {
    new UserModel({
      role: 0,
      password: bhash(config.auth.defaultPassword)
    })
    .save()
    .catch(err => debug.error(err.message))
  }
}
