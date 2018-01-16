/**
 * @desc Admin schema
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('../../config')
const { isEmail, isSiteUrl } = require('../../util')

const userSchema = new mongoose.Schema({
  name: { type: String, default: config.auth.defaultName, required: true },
  email: { type: String, required: true, validate: isEmail },
  avatar: { type: String, required: true },
  site: { type: String, validate: isSiteUrl },
  slogan: { type: String },
  description: { type: String, default: '' },
  // 角色 0 管理员 | 1 普通用户 | 2 github用户
  role: { type: Number, default: 1 },
  // role = 0的时候才有该项
  password: { type: String },
  // 是否被禁言
  mute: { type: Boolean, default: false },
  company: { type: String, default: '' },
  location: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  github: {
    id: { type: String, default: '' },
    login: { type: String, default: '' }
  }
})

module.exports = userSchema
