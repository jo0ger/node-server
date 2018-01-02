/**
 * @desc Plugins entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 29 Oct 2017
 */

'use strict'

exports.mongo = require('./mongo')
exports.redis = require('./redis')
exports.akismet = require('./akismet')
exports.validation = require('./validation')
exports.mailer = require('./mailer')
exports.gc = require('./gc')
