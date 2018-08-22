/**
 * @desc jwt sign token
 */

const jwt = require('jsonwebtoken')

exports.sign = (app, payload = {}, isLogin = true) => {
	const { secrets, session } = app.config.auth
	return jwt.sign(payload, secrets, { expiresIn: isLogin ? session.maxAge : 0 })
}