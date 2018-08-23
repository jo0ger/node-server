/**
 * @desc Reponse middleware
 */

module.exports = (opt, app) => {
    const { codeMap } = app.config
    const successMsg = codeMap[200]
    const failMsg = codeMap[-1]

    return async (ctx, next) => {
        ctx.success = (data = null, message = successMsg) => {
            if (app.utils.validate.isString(data)) {
                message = data
                data = null
            }
            ctx.status = 200
            ctx.body = {
                code: 200,
                success: true,
                message,
                data
            }
        }
        ctx.fail = (code = -1, message = '', error = null) => {
            if (app.utils.validate.isString(code)) {
                error = message || null
                message = code
                code = -1
            }
            const body = {
                code,
                success: false,
                message: message || codeMap[code] || failMsg
            }
            if (error) body.error = error
            ctx.status = code === -1 ? 200 : code
            ctx.body = body
        }

        await next()
    }
}
