/**
 * @desc 定时任务
 * @author Jooger <zzy1198258955@163.com>
 * @date 27 Oct 2017
 */

'use strict'

exports.start = () => {
  const { option, music, user } = require('../controller')
  // 友链 每1小时更新一次
  option.updateOptionLinks()
  setInterval(option.updateOptionLinks.bind(option), 1000 * 60 * 60 * 1)

  // 用户 每1天更新一次
  user.updateGithubInfo()
  setInterval(user.updateGithubInfo.bind(user), 1000 * 60 * 60 * 24)
}
