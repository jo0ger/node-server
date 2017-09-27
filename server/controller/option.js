/**
 * @desc Option controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const { OptionModel } = require('../model')
const { getGithubUsersInfo } = require('../service')

exports.data = async (ctx, next) => {
  const data = await OptionModel.findOne().exec().catch(err => {
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

  const data = await updateOption(option)

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

// 每3小时更新一次
setInterval(updateOption, 1000 * 60 * 60 * 3)

async function updateOption (option = null) {
  if (!option) {
    option = await OptionModel.findOne().exec().catch(err => {
      ctx.log.error(err.message)
      return {}
    })
  }
  // 更新友链
  if (option.links) {
    const githubNames = option.links.map(link => link.github)
    const usersInfo = await getGithubUsersInfo(githubNames)

    if (usersInfo) {
      option.links = option.links.map((link, index) => {
        const userInfo = usersInfo[index]
        if (userInfo) {
          link.avatar = userInfo.avatar_url
          link.slogan = userInfo.bio
          link.site = link.site || userInfo.blog
        }
        return link
      })
    }
  }

  const data = await OptionModel.findOneAndUpdate({}, option, { new: true }).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  return data
}
