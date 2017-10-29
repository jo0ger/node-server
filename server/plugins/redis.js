/**
 * @desc Redis connect
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Oct 2017
 */

'use strict'

const redis = require('redis')
const config = require('../config')
const { getDebug, isType } = require('../util')
const debug = getDebug('Redis')
let client = null
const cache = {}

exports.connect = () => {
  if (client) {
    return debug('已连接')
  }
  client = redis.createClient(config.redis)
  client.on('error', err => {
    debug.error('连接失败, 错误: ', err.message)
    client = null
  })
  client.on('connect', () => debug.success('连接成功'))
  client.on('reconnecting', () => debug('正在重连中...'))
}

exports.set = (key = '', value = '') => new Promise((resolve, reject) => {
  if (client) {
    if (!isType(value, 'String')) {
      try {
				value = JSON.stringify(value)
			} catch (err) {
        debug.error('存储时，序列化失败, 错误：%s', err.message)
				value = value.toString()
			}
    }
    client.set(key, value, (err, res) => {
      if (err) {
        debug.error('存储【 %s 】失败，错误：%s', key, err.message)
        return reject(err)
      }
      resolve(res)
    })
  } else {
    cache[key] = value
    resolve(value)
  }
})


exports.get = (key = '') => new Promise((resolve, reject) => {
  if (client) {
    client.get(key, (err, res) => {
      if (err) {
        debug.error('读取【 %s 】失败，错误：%s', key, err.message)
        return reject(err)
      }
      try {
				res = JSON.parse(res)
			} catch (err) {
        debug.error('获取时，序列化失败, 错误：%s', err.message)
			}
      resolve(res)
    })
  } else {
    resolve(cache[key])
  }
})
