/**
 * @desc Routes entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const Router = require('koa-router')
const frontend = require('./frontend')
const backend = require('./backend')
const router = new Router({
  prefix: '/api'
})

module.exports = app => {
  // router.use('/frontend', frontend.routes(), frontend.allowedMethods())
  // router.use('/backend', backend.routes(), backend.allowedMethods())
  app.use(router.routes(), router.allowedMethods())
}
