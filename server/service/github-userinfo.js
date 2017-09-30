/**
 * @desc github userinfo fetch service
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const axios = require('axios')
const { setDebug } = require('../util')
const debug = setDebug('github:user')

const getGithubUsersInfo = (githubNames = '') => {
  if (!githubNames) {
    return null
  } else if (typeof githubNames === 'string') {
    githubNames = [githubNames]
  } else if (!Array.isArray(githubNames)) {
    return null
  }

  const task = githubNames.map(name => {
    debug('fetch github user [', name, ']')
    return axios.get(`https://api.github.com/users/${name}`)
      .then(res => {
        if (res && res.status === 200) {
          debug.success('fetch github user success [', name, ']')
          return res.data
        }
        return null
      })
      .catch(err => {
        debug.error(err.message)
        return null
      })
  })

  return Promise.all(task)
}

module.exports = getGithubUsersInfo
