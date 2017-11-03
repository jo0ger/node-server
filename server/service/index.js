/**
 * @desc Services entry
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const { getGithubUsersInfo, getGithubAuthUserInfo } = require('./github-userinfo')

// exports.githubPassport = require('./github-passport')
exports.getGithubUsersInfo = getGithubUsersInfo
exports.getGithubAuthUserInfo = getGithubAuthUserInfo
exports.getGithubToken = require('./github-token')
exports.fetchNE = require('./netease-music')
exports.crontab = require('./crontab')
