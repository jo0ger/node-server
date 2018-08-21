'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app
    router.post('/home', controller.home.index)

    router.all('*', (ctx, next) => {
        const code = 404
        ctx.fail(code, app.config.codeMap[code])
    })
}
