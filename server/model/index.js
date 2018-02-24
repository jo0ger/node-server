/**
 * @desc Models entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const schemas = require('./schema')
const { firstUpperCase } = require('../util')
const models = {}

Object.keys(schemas).forEach(key => {
	const schema = getSchema(schemas[key])
	if (schema) {
		models[`${firstUpperCase(key)}Model`] = mongoose.model(firstUpperCase(key), schema)
	}
})

// 构建schema
function getSchema (schema) {
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
	this.findOneAndUpdate({}, { updatedAt: Date.now() })
	next()
}

module.exports = models
