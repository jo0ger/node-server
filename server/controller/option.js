/**
 * @desc Option controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const { optionProxy } = require('../proxy')
const { modelUpdate } = require('../service')

// 站点参数数据
exports.data = async (ctx, next) => {
	const data = await optionProxy.findOne().exec()
	data
		? ctx.success(data, '站点参数获取成功')
		: ctx.fail('站点参数获取失败')
}

// 站点参数更新
exports.update = async (ctx, next) => {
	const option = ctx.request.body
	const data = await modelUpdate.updateOption(option)
	data
		? ctx.success(data, '站点参数更新成功')
		: ctx.fail('站点参数更新失败')
}
