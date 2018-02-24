/**
 * @desc Reponse middleware
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const config = require('../config')
const { isType } = require('../util')
const successMsg = config.constant.codeMap['200']
const failMsg = config.constant.codeMap['-1']

module.exports = async (ctx, next) => {
	ctx.success = (data = null, message = successMsg) => {
		ctx.status = 200
		ctx.body = {
			code: 200,
			success: true,
			message,
			data
		}
	}

	ctx.fail = (code = -1, message = '', data = null) => {
		if (isType(code, 'String')) {
			data = message || null
			message = code
			code = -1
		}
		ctx.status = 200
		ctx.body = {
			code,
			success: false,
			message: message || config.constant.codeMap[code] || failMsg,
			data
		}
	}

	await next()
}
