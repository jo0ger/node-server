/**
 * @desc Routes entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')({
  prefix: '/api'
})
const frontend = require('./frontend')
const backend = require('./backend')

module.exports = app => {
  router.use('/frontend', frontend.routes(), frontend.allowedMethods())
  router.use('/backend', backend.routes(), backend.allowedMethods())
  
  router.all('*', (ctx,next)=> {
    ctx.fail(404, `${ctx.path} 不支持 ${ctx.method} 请求类型`)
    ctx.status = 404
  })
  
  app.use(router.routes(), router.allowedMethods())
}
