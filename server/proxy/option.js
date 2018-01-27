/**
 * @desc Option model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 28 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { OptionModel } = require('../model')

class OptionProxy extends BaseProxy {
  constructor () {
    super(OptionModel)
  }
}

module.exports = new OptionProxy()
