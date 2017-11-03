/**
 * @desc github userinfo fetch service
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const axios = require('axios')
const { getDebug } = require('../util')
const config = require('../config')
const { clientID, clientSecret } = config.sns.github
const debug = getDebug('Github:User')

exports.getGithubUsersInfo = (githubNames = '') => {
  if (!githubNames) {
    return null
  } else if (typeof githubNames === 'string') {
    githubNames = [githubNames]
  } else if (!Array.isArray(githubNames)) {
    return null
  }

  const task = githubNames.map(name => {
    return axios.get(`https://api.github.com/users/${name}`, {
      params: {
        client_id: clientID,
        client_secret: clientSecret
      }
    }, {
      headers: {
        Accept: 'application/json'
      }
    }).then(res => {
      if (res && res.status === 200) {
        debug.success('抓取【 %s 】信息成功', name,)
        return res.data
      }
      return null
    })
    .catch(err => {
      debug.error('抓取【 %s 】信息失败，错误：%s', name, err.message)
      return null
    })
  })

  return Promise.all(task)
}

exports.getGithubAuthUserInfo = (access_token = '') => {
  return axios.get('https://api.github.com/user', {
    params: { access_token }
  }).then(res => {
    return res.data
  }).catch(err => {
    debug.error('获取用户信息失败，错误：', err.message)
    return null
  })
}