/**
 * @desc Server entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const Koa = require('koa')
const json = require('koa-json')
const logger = require('koa-logger')
const onerror = require('koa-onerror')
const bouncer = require('koa-bouncer')
const session = require('koa-session')
const passport = require('koa-passport')
const compress = require('koa-compress')
const bodyparser = require('koa-bodyparser')
const koaBunyanLogger = require('koa-bunyan-logger')

const packageInfo = require('../package.json')
const middlewares = require('./middleware')
const config = require('./config')
const { mongo, redis, akismet, validation, mailer, gc } = require('./plugins')
const { crontab } = require('./service')
const isProd = process.env.NODE_ENV === 'production'

const app = new Koa()

// connect mongodb
mongo.connect()

// connect redis
redis.connect()

// load custom validations
bouncer.Validator = validation

// error handler
onerror(app)

app.keys = config.auth.secrets

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(koaBunyanLogger({
  name: packageInfo.name,
  level: 'debug'
}))
app.use(bouncer.middleware())
app.use(middlewares.response)
app.use(middlewares.error)
// form parse
// app.use(middlewares.formidable())
app.use(session(config.auth.session, app))
app.use(passport.initialize())
app.use(compress())

// routes
require('./routes')(app)

// akismet
akismet.start()

// mailer
mailer.start()

// crontab
crontab.start()

if (isProd) {
  // v8 gc
  gc.start()
}

app.on('error', function () {})

module.exports = app
