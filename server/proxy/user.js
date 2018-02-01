/**
 * @desc User model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

const BaseProxy = require('./base')
const { UserModel } = require('../model')

class UserProxy extends BaseProxy {
	constructor () {
		super(UserModel)
	}
}

module.exports = new UserProxy()
