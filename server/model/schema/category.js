/**
 * @desc Category
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Oct 2017
 */

'use strict'

const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

module.exports = categorySchema
