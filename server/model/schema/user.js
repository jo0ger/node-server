/**
 * @desc Admin schema
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const config = require('../../config')

const userSchema = new mongoose.Schema({
  name: { type: String, default: config.auth.defaultName, required: true },
  password: {
    type: String,
    default: ''
  },
  slogan: { type: String, default: '' },
  avatar: { type: String, default: '' },
  // 角色 0 管理员 | 1 普通用户
  role: { type: Number, default: 1 },
  // 是否被禁言
  mute: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  github: {
    id: { type: String, default: '' },
    email: { type: String, default: '' },
    login: { type: String, default: '' },
    name: { type: String, default: '' },
    blog: { type: String, default: '' },
  }
})

module.exports = userSchema
