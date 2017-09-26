/**
 * @desc Error monitor
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    let code = err.status || 500

    if (err.name === 'ValidationError') {
      code = 10001
    }

    ctx.fail(code, err.message)
    ctx.status = 200
    
    if (code === 500) {
      ctx.log.error(
        { req: ctx.req, err },
        '  --> %s %s %d',
        ctx.request.method,
        ctx.request.originalUrl,
        ctx.status
      )
    }
  }
}