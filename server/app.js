/**
 * @desc Server entrance
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
const compress = require('koa-compress')
const bodyparser = require('koa-bodyparser')
const koaBunyanLogger = require('koa-bunyan-logger')
const packageInfo = require('../package.json')
const middlewares = require('./middleware')
const routes = require('./routes')
const config = require('./config')
const { mongo, redis, akismet, validation, mailer, crontab } = require('./plugins')
const isProd = process.env.NODE_ENV === 'production'

const app = new Koa()
app.keys = config.auth.secrets

// load custom validations
bouncer.Validator = validation

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(koaBunyanLogger({
	name: packageInfo.name,
	level: 'debug'
}))
app.use(koaBunyanLogger.requestIdContext({
	header: 'Request-Id'
}))
app.use(bouncer.middleware())
app.use(middlewares.response)
app.use(middlewares.error)
// form parse
// app.use(middlewares.formidable())
app.use(session(config.auth.session, app))
app.use(compress())

// routes
routes(app)

// connect mongodb
mongo.connect()

// connect redis
redis.connect()

if (isProd) {
	// akismet
	akismet.start()

	// mailer
	mailer.start()
}

// crontab
crontab.start()

module.exports = app
