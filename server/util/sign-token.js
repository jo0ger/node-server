/**
 * @desc jwt sign token
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Sep 2017
 */

'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = (payload = {}, isLogin = true) => {
	const { secrets, session } = config.auth
	return jwt.sign(payload, secrets, { expiresIn: isLogin ? session.maxAge : 0 })
}
