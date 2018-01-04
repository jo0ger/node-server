/**
 * @desc Category
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Oct 2017
 */

'use strict'

const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // 排序 首页分类展示顺序
  list: { type: Number, default: 1 },
  extends: [{
    key: { type: String, validate: /\S+/ },
    value: { type: String, validate: /\S+/ }
  }]
})

module.exports = categorySchema
