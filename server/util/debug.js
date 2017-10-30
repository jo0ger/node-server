/**
 * @desc Debug wrapper for debug
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const debug = require('debug')
const packageInfo = require('../../package.json')

const levelMap = {
  success: {
    level: 2,
    emoji: '✅'
  },
  info: {
    level: 6,
    emoji: '⚡️'
  },
  warn: {
    level: 3,
    emoji: '⚠️'
  },
  error: {
    level: 1,
    emoji: '❌'
  }
}
const slice = Array.prototype.slice

module.exports = function getDebug (namespace = '') {
  const deBug = debug(`[${packageInfo.name}] ${namespace || ''}`)
  function d () {
    d.info.apply(d, slice.call(arguments))
  }

  Object.keys(levelMap).map(key => {
    d[key] = function () {
      deBug.enabled = true
      deBug.color = levelMap[key].level
      const args = slice.call(arguments)
      args[0] = levelMap[key].emoji + '  ' + args[0]
      deBug.apply(null, args)
    }
  })

  return d
}
