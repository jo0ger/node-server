/**
 * @desc 统一错误处理
 */

module.exports = (opt, app) => {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
            ctx.app.emit('error', err, ctx)
            app.logger.error(err)
            let code = err.status || 500
            if (code === 200) code = -1
            let message = ''
            if (app.config.isProd) {
                message = app.config.codeMap[code]
            } else {
                message = err.message
            }
            ctx.fail(code, message, err.errors)
        }
    }
}
