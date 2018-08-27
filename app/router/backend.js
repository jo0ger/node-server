module.exports = app => {
    const backendRouter = app.router.namespace('/v2/backend')
    const { controller, middlewares } = app
    const auth = middlewares.auth(app)

    // Article
    backendRouter.get('/articles', auth, controller.article.list)
    backendRouter.get('/articles/archives', auth, controller.article.archives)
    backendRouter.get('/articles/:id', auth, controller.article.item)
    backendRouter.post('/articles', auth, controller.article.create)
    backendRouter.put('/articles/:id', auth, controller.article.update)
    backendRouter.patch('/articles/:id', auth, controller.article.update)
    backendRouter.patch('/articles/:id/like', auth, controller.article.like)
    backendRouter.delete('/articles/:id', auth, controller.article.delete)

    // Category
    backendRouter.get('/categories', auth, controller.category.list)
    backendRouter.get('/categories/:id', auth, controller.category.item)
    backendRouter.post('/categories', auth, controller.category.create)
    backendRouter.put('/categories/:id', auth, controller.category.update)
    backendRouter.patch('/categories/:id', auth, controller.category.update)
    backendRouter.delete('/categories/:id', auth, controller.category.delete)

    // Tag
    backendRouter.get('/tags', auth, controller.tag.list)
    backendRouter.get('/tags/:id', auth, controller.tag.item)
    backendRouter.post('/tags', auth, controller.tag.create)
    backendRouter.put('/tags/:id', auth, controller.tag.update)
    backendRouter.patch('/tags/:id', auth, controller.tag.update)
    backendRouter.delete('/tags/:id', auth, controller.tag.delete)

    // Comment
    backendRouter.get('/comments', auth, controller.comment.list)
    backendRouter.get('/comments/:id', auth, controller.comment.item)
    backendRouter.post('/comments', auth, controller.comment.create)
    backendRouter.patch('/comments/:id', auth, controller.comment.update)
    backendRouter.delete('/comments/:id', auth, controller.comment.delete)
    backendRouter.post('/comments/:id/like', auth, controller.comment.like)

    // User
    backendRouter.get('/users', auth, controller.user.list)
    backendRouter.get('/users/:id', auth, controller.user.item)

    // Setting
    backendRouter.get('/setting', auth, controller.setting.index)
    backendRouter.put('/setting', auth, controller.setting.update)
    backendRouter.patch('/setting', auth, controller.setting.update)

    // Auth
    backendRouter.post('/auth/login', controller.auth.login)
    backendRouter.get('/auth/logout', auth, controller.auth.logout)
    backendRouter.get('/auth/info', auth, controller.auth.info)
}
