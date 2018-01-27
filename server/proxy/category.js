/**
 * @desc Category model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { CategoryModel } = require('../model')

class CategoryProxy extends BaseProxy {
  constructor () {
    super(CategoryModel)
  }
}

module.exports = new CategoryProxy()
