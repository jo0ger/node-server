/**
 * @desc Util entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const packageInfo = require('../../package.json')
const debug = require('debug')

exports.setDebug = level => {
  const deBug = debug(`[${packageInfo.name}]${level ? ' ' + level : ''}`)
  deBug.enabled = true
  return deBug
}

exports.signToken = require('./sign-token')

exports.marked = require('./marked')

exports.createObjectId = () => mongoose.Types.ObjectId()

exports.isObjectId = (str = '') => mongoose.Types.ObjectId.isValid(str)

// 首字母大写
exports.firstUpperCase = (str = '') => str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())

exports.bhash = (str = '') => bcrypt.hashSync(str, 8)

exports.bcompare = (str, hash) => bcrypt.compareSync(str, hash)

exports.randomString = (length = 8) => {
  const chars = `ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz`
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}
