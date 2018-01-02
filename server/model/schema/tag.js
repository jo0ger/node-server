/**
 * @desc Tag
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  extends: [{
    key: { type: String, validate: /\S+/ },
    value: { type: String, validate: /\S+/ }
  }]
})

module.exports = tagSchema
