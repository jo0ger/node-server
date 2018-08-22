module.exports = app => {
    const { router, config } = app

    router.get('/', async (ctx, next) => {
		ctx.body = {
			name: config.name,
			version: config.version,
			author: config.pkg.author,
			github: 'https://github.com/jo0ger',
			site: config.site,
			poweredBy: ['Egg', 'Koa2', 'MongoDB', 'Nginx', 'Redis']
		}
	})

    frontend(app)
    backend(app)

    router.all('*', (ctx, next) => {
        const code = 404
        ctx.fail(code, app.config.codeMap[code])
    })
}

function frontend (app) {
    const { router, controller } = app

    // Category
    router.get('/categories', controller.category.list)
    router.get('/categories/:id', controller.category.item)

    // Tag
    router.get('/tags', controller.tag.list)
    router.get('/tags/:id', controller.tag.item)

    return router
}

function backend (app) {
    const { router, controller, middlewares } = app

    // Category
    router.get('/backend/categories', middlewares.auth(app), controller.category.list)
    router.get('/backend/categories/:id', middlewares.auth(app), controller.category.item)
    router.post('/backend/categories', middlewares.auth(app), controller.category.create)
    router.put('/backend/categories/:id', middlewares.auth(app), controller.category.update)
    router.patch('/backend/categories/:id', middlewares.auth(app), controller.category.update)
    router.delete('/backend/categories/:id', middlewares.auth(app), controller.category.delete)

    // Tag
    router.get('/backend/tags', middlewares.auth(app), controller.tag.list)
    router.get('/backend/tags/:id', middlewares.auth(app), controller.tag.item)
    router.post('/backend/tags', middlewares.auth(app), controller.tag.create)
    router.put('/backend/tags/:id', middlewares.auth(app), controller.tag.update)
    router.patch('/backend/tags/:id', middlewares.auth(app), controller.tag.update)
    router.delete('/backend/tags/:id', middlewares.auth(app), controller.tag.delete)

    return router
}
