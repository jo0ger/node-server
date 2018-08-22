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
    const { router, controller } = app

    // Category
    router.get('/backend/categories', controller.category.list)
    router.get('/backend/categories/:id', controller.category.item)
    router.post('/backend/categories', controller.category.create)
    router.put('/backend/categories/:id', controller.category.update)
    router.patch('/backend/categories/:id', controller.category.update)
    router.delete('/backend/categories/:id', controller.category.delete)

    // Tag
    router.get('/backend/tags', controller.tag.list)
    router.get('/backend/tags/:id', controller.tag.item)
    router.post('/backend/tags', controller.tag.create)
    router.put('/backend/tags/:id', controller.tag.update)
    router.patch('/backend/tags/:id', controller.tag.update)
    router.delete('/backend/tags/:id', controller.tag.delete)

    return router
}
