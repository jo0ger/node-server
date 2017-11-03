/**
 * @desc Site Log
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const logSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now }
})

logSchema.plugin(mongoosePaginate)

module.exports = logSchema
