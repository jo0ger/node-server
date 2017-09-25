/**
 * @desc Server entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const Koa = require('koa')
const json = require('koa-json')
const logger = require('koa-logger')
const onerror = require('koa-onerror')
const bouncer = require('koa-bouncer')
const compress = require('koa-compress')
const bodyparser = require('koa-bodyparser')
const koaBunyanLogger = require('koa-bunyan-logger')
const middlewares = require('./middleware')

const app = new Koa()

require('./util')
require('./mongo')()

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(koaBunyanLogger())
app.use(compress())
app.use(bouncer.middleware())
app.use(middlewares.response)
app.use(middlewares.error)

// routes
require('./routes')(app)

module.exports = app
