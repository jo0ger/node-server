/**
 * @desc Reponse middleware
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { isType } = require('../util')

module.exports = async (ctx, next) => {
  ctx.success = (data = null, message = config.codeMap[200]) => {
    ctx.status = 200
    ctx.body = {
      code: 200,
      success: true,
      message,
      data
    }
  }

  ctx.fail = (code = -1, message = '', data = null) => {
    if (isType(code, 'String')) {
      data = message || null
      message = code
      code = -1
    }
    ctx.status = 200
    ctx.body = {
      code,
      success: false,
      message: message || config.codeMap[code] || config.codeMap['-1'],
      data
    }
  }

  await next()
}
