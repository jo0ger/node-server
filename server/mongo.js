/**
 * @desc Mongodb connect
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('./config')
const { UserModel, OptionModel } = require('./model')
const { bhash, getDebug } = require('./util')
const debug = getDebug('MongoDB')
let isConnected = false

mongoose.Promise = global.Promise

exports.connect = () => {
  mongoose.connect(config.mongo.uri, config.mongo.option).then(() => {
    debug.success('连接成功')
    isConnected = true
    seed()
  }, err => {
    isConnected = false
    return debug.error('连接失败，错误: ', config.mongo.uri, err.message)
  })
}

exports.seed = seed

function seed () {
  if (isConnected) {
    seedOption()
    seedAdmin()
  }
}

// 参数初始化
async function seedOption () {
  const option = await OptionModel.findOne().exec().catch(err => debug.error(err.message))

  if (!option) {
    await new OptionModel().save().catch(err => debug.error(err.message))
  }
}

// 管理员初始化
function seedAdmin () {
  UserModel.findOne({ role: 0 }).exec().then(data => {
    if (!data) {
      createAdmin()
    }
  }).catch(err => debug.error(err.message))

  function createAdmin () {
    new UserModel({
      role: 0,
      password: bhash(config.auth.defaultPassword)
    })
    .save()
    .catch(err => debug.error(err.message))
  }
}
