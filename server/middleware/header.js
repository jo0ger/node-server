/**
 * @desc 设置相应头
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const config = require('../config')

module.exports = async (ctx, next) => {
  const { request, response } = ctx
  const allowedOrigins = config.auth.allowedOrigins
  const origin = request.get('origin') || ''
  const allowed = request.query._DEV_ ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    allowedOrigins.find(item => origin.includes(item))
  if (allowed) {
    response.set('Access-Control-Allow-Origin', origin)
  }
  response.set("Access-Control-Allow-Headers", "Authorization, Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With")
  response.set("Access-Control-Allow-Methods", "PUT,PATCH,POST,GET,DELETE,OPTIONS")
  response.set("Access-Control-Allow-Credentials", true)
  response.set("Content-Type", "application/json;charset=utf-8")
  response.set("X-Powered-By", `${config.name}/${config.version}`)

  if (request.method === 'OPTIONS') {
    return ctx.success('ok')
  }
  await next()
}
