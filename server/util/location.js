/**
 * @desc 获取ip和location
 * @author Jooger <zzy1198258955@163.com>
 * @date 30 Oct 2017
 */

'use strict'

const geoip = require('geoip-lite')

module.exports = (req = {}) => {
  const ip = (req.headers['x-forwarded-for'] || 
    req.headers['x-real-ip'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    req.ip ||
    req.ips[0] || '').replace('::ffff:', '')
  return {
    ip,
    location: geoip.lookup(ip) || {}
  }
}
