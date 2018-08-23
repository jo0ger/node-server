/**
 * @desc jwt sign token
 */

const jwt = require('jsonwebtoken')

exports.sign = (app, payload = {}, isLogin = true) => {
    return jwt.sign(payload, app.config.secrets, { expiresIn: isLogin ? app.config.session.maxAge : 0 })
}
