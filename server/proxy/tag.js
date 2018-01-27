/**
 * @desc Tag model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { TagModel } = require('../model')

class TagProxy extends BaseProxy {
  constructor () {
    super(TagModel)
  }
}

module.exports = new TagProxy()
