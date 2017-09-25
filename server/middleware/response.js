/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')

module.exports = async (ctx, next) => {
  ctx.success = (data = null) => {
    ctx.status = 200
    ctx.body = {
      code: 200,
      success: true,
      message: config.codeMap('200'),
      data
    }
  }

  ctx.fail = (code = -1, message = config.codeMap['-1'], data = null) => {
    ctx.status = 200
    ctx.send(200, {
      code,
      success: false,
      message,
      data
    })
  }

  await next()
}
