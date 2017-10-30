/**
 * @desc V8 GC
 * @author Jooger <zzy1198258955@163.com>
 * @date 30 Oct 2017
 */

'use strict'

const gc = require('idle-gc')
const gcStat = require('gc-stats')
const debug = require('../util').getDebug('GC')

exports.start = (interval = 5000, delay = 5000) => {
  setTimeout(() => {
    gcStat().on('stats', stats => {
      debug('回收完毕，用时 %s ms，共回收 %s KB堆内存', stats.pauseMS, stats.diff.totalHeapSize / 1000)
    })
    gc.start(interval)
    debug.success('服务启动成功')
  }, delay)
}

exports.stop = () => gc.stop()