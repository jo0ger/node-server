module.exports = (opt, app) => {
    return async (ctx, next) => {
        try {
            await next()
        } catch (err) {
            let code = err.status || 500
            const message = app.config.codeMap[code] || err.message
            if (err.code === 'invalid_param') {
                code = 422
            }
            ctx.fail(code, message, err.errors)
        }
    }
}