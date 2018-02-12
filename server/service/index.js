/**
 * @desc Services entry
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Sep 2017
 */

'use strict'

const { getGithubUsersInfo, getGithubAuthUserInfo } = require('./github-userinfo')

exports.getGithubUsersInfo = getGithubUsersInfo
exports.getGithubAuthUserInfo = getGithubAuthUserInfo
exports.getGithubToken = require('./github-token')
exports.netease = require('./netease-music')
exports.modelUpdate = require('./model-update')
