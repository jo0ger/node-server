module.exports = app => {
    const { router, config } = app

    router.get('/', async ctx => {
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

    router.all('*', ctx => {
        const code = 404
        ctx.fail(code, app.config.codeMap[code])
    })
}

function frontend (app) {
    const { router, controller } = app

    // Article
    router.get('/articles', controller.article.list)

    // Category
    router.get('/categories', controller.category.list)
    router.get('/categories/:id', controller.category.item)

    // Tag
    router.get('/tags', controller.tag.list)
    router.get('/tags/:id', controller.tag.item)

    // User
    router.get('/users/:id', controller.user.item)

    // Setting
    router.get('/setting', controller.setting.index)

    return router
}

function backend (app) {
    const { router, controller, middlewares } = app
    const auth = middlewares.auth(app)

    // Category
    router.get('/backend/categories', auth, controller.category.list)
    router.get('/backend/categories/:id', auth, controller.category.item)
    router.post('/backend/categories', auth, controller.category.create)
    router.put('/backend/categories/:id', auth, controller.category.update)
    router.patch('/backend/categories/:id', auth, controller.category.update)
    router.delete('/backend/categories/:id', auth, controller.category.delete)

    // Tag
    router.get('/backend/tags', auth, controller.tag.list)
    router.get('/backend/tags/:id', auth, controller.tag.item)
    router.post('/backend/tags', auth, controller.tag.create)
    router.put('/backend/tags/:id', auth, controller.tag.update)
    router.patch('/backend/tags/:id', auth, controller.tag.update)
    router.delete('/backend/tags/:id', auth, controller.tag.delete)

    // User
    router.get('/backend/users', auth, controller.user.list)
    router.get('/backend/users/:id', auth, controller.user.item)

    // Setting
    router.get('/backend/setting', auth, controller.setting.index)
    router.put('/backend/setting', auth, controller.setting.update)
    router.patch('/backend/setting', auth, controller.setting.update)

    // Auth
    router.post('/backend/auth/login', controller.auth.login)
    router.get('/backend/auth/logout', auth, controller.auth.logout)
    router.get('/backend/auth/info', auth, controller.auth.info)

    return router
}
