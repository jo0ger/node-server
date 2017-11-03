/**
 * @desc Github access_token
 * @author Jooger <zzy1198258955@163.com>
 * @date 2 Nov 2017
 */

'use strict'

const axios = require('axios')
const { getDebug } = require('../util')
const config = require('../config')
const { clientID, clientSecret } = config.sns.github
const debug = getDebug('Github:Token')

module.exports = async (code) => {
  const data = await axios.post('https://cors-anywhere.herokuapp.com/https://github.com/login/oauth/access_token', {
    client_id: clientID,
    client_secret: clientSecret,
    code
  }, {
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .catch(err => {
    debug.error('Github Token获取失败，错误：', err.message)
    return null
  })

  if (data && data.data.access_token) {
    return data.data
  }
  return null
}
