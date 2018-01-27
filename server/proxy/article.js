/**
 * @desc Article model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { ArticleModel } = require('../model')

class ArticleProxy extends BaseProxy {
  constructor () {
    super(ArticleModel)
  }
}

module.exports = new ArticleProxy()
