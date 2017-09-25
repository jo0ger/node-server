/**
 * @desc Admin schema
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const md5 = require('md5')
const config = require('../../config')

const adminSchema = new mongoose.Schema({
  name: { type: String, default: config.auth.defaultName, required: true },
  password: {
    type: String,
    default: md5(`${config.auth.secretKey}${config.auth.defaultPassword}`),
    required: true
  },
  slogan: { type: String, default: '' },
  avatar: { type: String, default: '' }
})

module.exports = adminSchema
