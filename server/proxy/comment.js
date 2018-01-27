/**
 * @desc Comment model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { CommentModel } = require('../model')

class CommentProxy extends BaseProxy {
  constructor () {
    super(CommentModel)
  }
}

module.exports = new CommentProxy()
