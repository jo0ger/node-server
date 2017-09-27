/**
 * @desc jwt sign token
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = (payload = {}, isLogin = true) => {
  const { secrets, session } = config.auth
  return jwt.sign(payload, secrets, { expiresIn: isLogin ? session.maxAge : 0 })
}
