/**
 * @desc Option controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const { OptionModel } = require('../model')
const { getGithubUsersInfo } = require('../service')
const { updateMusicCache } = require('./music')
const { getDebug, proxy } = require('../util')
const debug = getDebug('Option')

exports.data = async (ctx, next) => {
  const data = await OptionModel.findOne().exec().catch(err => {
    debug.error('查找失败，错误：', err.message)
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.update = async (ctx, next) => {
  const option = ctx.request.body

  const data = await exports.updateOptionLinks(option)

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

// update lock
let lock = false
exports.updateOptionLinks = async function (option = null) {
  if (lock) {
    debug.warn('友链更新中...')
    return
  }
  lock = true
  if (!option) {
    option = await OptionModel.findOne().exec().catch(err => {
      debug.error('数据查找失败，错误：', err.message)
      ctx.log.error(err.message)
      return {}
    })
  }

  // 更新友链
  option.links = await generateLinks(option.links)

  const data = await OptionModel.findOneAndUpdate({}, option, { new: true }).exec().catch(err => {
    debug.error('数据更新失败，错误：', err.message)
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    debug.success('友链更新成功')
  }
  lock = false
  return data
}

// 更新友链
async function generateLinks (links = []) {
  if (links && links.length) {
    const githubNames = links.map(link => link.github)
    const usersInfo = await getGithubUsersInfo(githubNames)

    if (usersInfo) {
      return links.map((link, index) => {
        const userInfo = usersInfo[index]
        if (userInfo) {
          link.avatar = proxy(userInfo.avatar_url)
          link.slogan = userInfo.bio
          link.site = link.site || userInfo.blog || userInfo.url
        }
        return link
      })
    }
  }
  return links
}
