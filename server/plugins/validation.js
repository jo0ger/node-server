/**
 * @desc Custom Validations for koa-bouncer
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const Validator = require('koa-bouncer').Validator
const { isObjectId } = require('../util')

Validator.addMethod('notEmpty', function (tip) {
  this.isString(`the "${this.key}" parameter should be String type`)
  if (this.val().length === 0) {
    this.throwError(tip || `the "${this.key}" parameter should not be empty value`)
  }
  return this
})

Validator.addMethod('isObjectId', function (tip) {
  const val = this.val()
  if (val !== undefined) {
    this.toString()
    if (!mongoose.Types.ObjectId.isValid(val)) {
      this.throwError(tip || `the "${this.key}" parameter should be ObjectId type`)
    }
  }
  return this
})

Validator.addMethod('isObjectIdArray', function (tip) {
  const val = this.val()
  if (val !== undefined) {
    this.isArray()
    val.forEach(data => {
      if (!isObjectId(data)) {
        this.throwError(tip || `the "${this.key}" parameter contains a data(${data}) that is not ObjectId type`)
      }
    })
  }
  return this
})

module.exports = Validator
