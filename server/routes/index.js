/**
 * @desc Routes entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const frontend = require('./frontend')
const backend = require('./backend')
const { header } = require('../middleware')
const config = require('../config')

module.exports = app => {
  router.use('*', header)

  router.get('/', async (ctx, next) => {
    ctx.log.info('Got a root request from %s for %s', ctx.request.ip, ctx.path)
  	ctx.body = {
  	  name: config.name,
  	  version: config.version,
  	  author: config.author,
  	  github: 'https://github.com/jo0ger',
  	  site: config.site,
  	  poweredBy: ['Koa2', 'MongoDB', 'Nginx']
  	}
  })

  router.use('/backend', backend.routes(), backend.allowedMethods())
  router.use(frontend.routes(), frontend.allowedMethods())

  router.all('*', (ctx,next)=> {
    ctx.fail(404, `${ctx.path} 不支持 ${ctx.method} 请求类型`)
    ctx.status = 404
  })

  app.use(router.routes(), router.allowedMethods())
}
