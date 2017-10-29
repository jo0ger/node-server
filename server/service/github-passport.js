/**
 * @desc github password service
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Sep 2017
 */

'use strict'

const passport = require('koa-passport')
const GithubStrategy = require('passport-github').Strategy
const config = require('../config')
const { clientID, clientSecret, callbackURL } = config.sns.github
const { randomString, getDebug, proxy } = require('../util')
const debug = getDebug('Github:Auth')

exports.init = (UserModel, config) => {
  passport.use(new GithubStrategy({
    clientID,
    clientSecret,
    callbackURL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, done) => {
    debug('Github权限验证开始...')
    try {
      const user = await UserModel.findOne({
        'github.id': profile.id
      }).catch(err => {
        debug.error('本地用户查找失败, 错误：', err.message)
        return null
      })

      if (user) {
        const userData = {
          name: profile.displayName || profile.username,
          avatar: proxy(profile._json.avatar_url),
          slogan: profile._json.bio,
          github: profile._json,
          role: user.role
        }

        userData.github.token = accessToken

        const updatedUser = await UserModel.findByIdAndUpdate(user._id, userData).exec().catch(err => {
          debug.error('本地用户更新失败, 错误：', err.message)
        }) || user

        return end(null, updatedUser)
      }

      const newUser = {
        name: profile.displayName || profile.username,
        avatar: proxy(profile._json.avatar_url),
        slogan: profile._json.bio,
        github: profile._json,
        role: 1
      }

      newUser.github.token = accessToken

      const checkUser = await UserModel.findOne({ name: newUser.name }).exec().catch(err => {
        debug.error('本地用户查找失败, 错误：', err.message)
        return true
      })

      if (checkUser) {
        newUser.name += '-' + randomString()
      }

      const data = await new UserModel(newUser).save().catch(err => {
        debug.error('本地用户创建失败, 错误：', err.message)
      })

      return end(null, data)
    } catch (err) {
      debug.error('Github权限验证失败，错误：', err)
      return end(err)
    }

    function end (err, data) {
      debug.success('Github权限验证成功')
      done(err, data)
    }
  }))
}

