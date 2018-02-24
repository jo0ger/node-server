/**
 * @desc Error monitor
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

module.exports = async (ctx, next) => {
	try {
		await next()
	} catch (err) {
		let code = err.status || 500
		if (err.name === 'ValidationError') {
			code = 10001
		}
		ctx.fail(code, err.message)
		ctx.status = 200
		if (code === 500) {
			// TODO: 错误日志记录
			ctx.log.error(
				{ req: ctx.req, err },
				'  --> %s %s %d',
				ctx.request.method,
				ctx.request.originalUrl,
				ctx.status
			)
		}
	}
}
