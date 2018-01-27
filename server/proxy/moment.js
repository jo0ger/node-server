/**
 * @desc Moment model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 28 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { MomentModel } = require('../model')

class MomentProxy extends BaseProxy {
  constructor () {
    super(MomentModel)
  }
}

module.exports = new MomentProxy()
