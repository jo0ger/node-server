/**
 * @desc Util entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const debug = require('debug')(require('../../package.json').name)

debug.enabled = true

exports.debug = debug

exports.marked = require('./marked')

exports.createObjectId = () => mongoose.Types.ObjectId()

exports.isObjectId = (str = '') => mongoose.Types.ObjectId.isValid(str)

// 首字母大写
exports.firstUpperCase = (str = '') => str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())

exports.bhash = (str = '') => bcrypt.hashSync(str, 8)

exports.bcompare = (str, hash) => bcrypt.compareSync(str, hash)
