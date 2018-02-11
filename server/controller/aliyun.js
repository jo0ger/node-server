/**
 * @desc Aliyun controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const config = require('../config')
const oss = config.aliyun.oss

exports.oss = async (ctx, next) => {
	oss
		? ctx.success({
			accessKeyId: 'LTAIMh28MLnWG7MA',
			accessKeySecret: 'B0v7JCx65VmtNws22BzFnTQcX2kzm9',
			bucket: oss.bucket,
			region: oss.region
		}, '阿里云OSS参数获取成功')
		: ctx.fail('阿里云OSS参数获取失败')
}
