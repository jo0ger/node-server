/**
 * @desc Admin schema
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('../../config')

const userSchema = new mongoose.Schema({
  name: { type: String, default: config.auth.defaultName, required: true },
  email: { type: String, required: true, validate: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/ },
  avatar: { type: String, required: true },
  site: { type: String, validate: /^((https|http):\/\/)+[A-Za-z0-9]+\.[A-Za-z0-9]+[\/=\?%\-&_~`@[\]\':+!]*([^<>\"\"])*$/ },
  slogan: { type: String },
  // 角色 0 管理员 | 1 普通用户 | 2 github用户
  role: { type: Number, default: 1 },
  // role = 0的时候才有该项
  password: { type: String },
  // 是否被禁言
  mute: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  github: {
    id: { type: String, default: '' },
    login: { type: String, default: '' },
  }
})

module.exports = userSchema
