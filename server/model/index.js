/**
 * @desc Models entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const schemas = require('./schema')
const models = {}

Object.keys(schemas).forEach(key => {
  const schema = buildSchema(schemas[key])
  if (schema) {
    models[`${firstUpperCase(key)}Model`] = mongoose.model(key, schema)
  }
})

// 构建schema
function buildSchema (schema) {
  if (!schema) {
    return null
  }
  schema.set('versionKey', false)
  schema.set('toObject', { getters: true })
  schema.set('toJSON', { getters: true, virtuals: false })
  schema.pre('findOneAndUpdate', updateHook)
  return schema
}

// 更新updatedAt
function updateHook (next) {
  this.findOneAndUpdate({}, { updatedAt: Date.now })
  next()
}

function firstUpperCase (str = '') {
  return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}

module.exports = models
