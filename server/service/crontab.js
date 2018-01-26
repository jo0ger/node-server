/**
 * @desc 定时任务
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Oct 2017
 */

'use strict'

exports.start = () => {
  const { option, user } = require('../controller')
  // 友链 每1小时更新一次
  option.updateOptionLinks()
  setInterval(() => option.updateOptionLinks(), 1000 * 60 * 60 * 1)

  // 用户 每1天更新一次
  user.updateGithubInfo()
  setInterval(() => user.updateGithubInfo(), 1000 * 60 * 60 * 24)
}
