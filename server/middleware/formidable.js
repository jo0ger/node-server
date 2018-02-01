/**
 * @desc Formidable 上传中间件，暂未使用
 * @author Jooger <iamjooger@gmail.com>
 * @date 10 Oct 2017
 */

'use strict'

const formidable = require('formidable')

const middleware = (opts = {}) => async (ctx, next) => {
	const res = await middleware.parse(opts, ctx).catch(err => {
		ctx.log.error(err.message)
		return null
	})
	if (res) {
		ctx.request.body = res.fields
		ctx.request.files = res.files
	}
	await next()
}

middleware.parse = (opts = {}, ctx) => {
	return new Promise((resolve, reject) => {
		const form = new formidable.IncomingForm()
		for (const key in opts) {
			form[key] = opts[key]
		}
		form.parse(ctx.request, (err, fields, files) => {
			if (err) return reject(err)
			resolve({
				fields,
				files
			})
		})
	})
}

module.exports = middleware
