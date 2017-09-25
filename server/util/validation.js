/**
 * @desc Custom Validations for koa-bouncer
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const Validator = require('koa-bouncer').Validator

Validator.addMethod('isObjectId', function (val, tip) {
  if (val && !mongoose.Types.ObjectId.isValid(val)) {
    this.throwError(tip || `the ${this.key} do not match the ObjectId type`)
  }
  return this
})

module.exports = Validator
