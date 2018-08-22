'use strict'

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
    const { router, controller } = app
    router.post('/home', controller.home.index)

    router.get('/tags', controller.tag.list)
    router.get('/tags/:id', controller.tag.item)
    router.post('/tags', controller.tag.create)
    router.put('/tags/:id', controller.tag.update)
    router.patch('/tags/:id', controller.tag.update)
    router.delete('/tags/:id', controller.tag.delete)

    router.all('*', (ctx, next) => {
        const code = 404
        ctx.fail(code, app.config.codeMap[code])
    })
}
