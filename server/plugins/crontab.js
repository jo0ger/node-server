/**
 * @desc 定时任务
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Oct 2017
 */

'use strict'

const { getDebug } = require('../util')
const { modelUpdate } = require('../service')
const debug = getDebug('Crontab')

exports.start = () => {
	// 友链 每1小时更新一次
	modelUpdate.updateOption()
	setInterval(modelUpdate.updateOption, 1000 * 60 * 60 * 1)

	// 用户 每1天更新一次
	modelUpdate.updateGithubInfo()
	setInterval(modelUpdate.updateGithubInfo, 1000 * 60 * 60 * 24)

	debug.success('定时任务启动成功')
}
