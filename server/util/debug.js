/**
 * @desc Debug wrapper for debug
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const debug = require('debug')
const packageInfo = require('../../package.json')

const levelMap = {
  success: 2,
  info: 6,
  warn: 3,
  error: 1
}
const slice = Array.prototype.slice

module.exports = function getDebug (namespace = '') {
  const deBug = debug(`[${packageInfo.name}]${namespace ? ' ' + namespace : ''}`)

  function d () {
    d.info.apply(d, slice.call(arguments))
  }

  Object.keys(levelMap).map(level => {
    d[level] = function () {
      deBug.enabled = true
      deBug.color = levelMap[level]
      deBug.apply(null, slice.call(arguments))
    }
  })

  return d
}
