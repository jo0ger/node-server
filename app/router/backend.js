module.exports = app => {
    const backendRouter = app.router.namespace('/v2/backend')
    const { controller, middlewares } = app
    const auth = middlewares.auth(app)

    // Article
    backendRouter.get('/articles', auth, controller.article.list)
    backendRouter.get('/articles/archives', auth, controller.article.archives)
    backendRouter.get('/articles/:id', auth, controller.article.item)
    backendRouter.post('/articles', auth, controller.article.create)
    backendRouter.patch('/articles/:id', auth, controller.article.update)
    backendRouter.patch('/articles/:id/like', auth, controller.article.like)
    backendRouter.patch('/articles/:id/unlike', auth, controller.article.unlike)
    backendRouter.delete('/articles/:id', auth, controller.article.delete)

    // Category
    backendRouter.get('/categories', auth, controller.category.list)
    backendRouter.get('/categories/:id', auth, controller.category.item)
    backendRouter.post('/categories', auth, controller.category.create)
    backendRouter.patch('/categories/:id', auth, controller.category.update)
    backendRouter.delete('/categories/:id', auth, controller.category.delete)

    // Tag
    backendRouter.get('/tags', auth, controller.tag.list)
    backendRouter.get('/tags/:id', auth, controller.tag.item)
    backendRouter.post('/tags', auth, controller.tag.create)
    backendRouter.patch('/tags/:id', auth, controller.tag.update)
    backendRouter.delete('/tags/:id', auth, controller.tag.delete)

    // Comment
    backendRouter.get('/comments', auth, controller.comment.list)
    backendRouter.get('/comments/:id', auth, controller.comment.item)
    backendRouter.post('/comments', auth, controller.comment.create)
    backendRouter.patch('/comments/:id', auth, controller.comment.update)
    backendRouter.patch('/comments/:id/like', auth, controller.comment.like)
    backendRouter.patch('/comments/:id/unlike', auth, controller.comment.unlike)
    backendRouter.delete('/comments/:id', auth, controller.comment.delete)

    // User
    backendRouter.get('/users', auth, controller.user.list)
    backendRouter.get('/users/:id', auth, controller.user.item)

    // Setting
    backendRouter.get('/setting', auth, controller.setting.index)
    backendRouter.patch('/setting', auth, controller.setting.update)

    // Auth
    backendRouter.post('/auth/login', controller.auth.login)
    backendRouter.get('/auth/logout', auth, controller.auth.logout)
    backendRouter.get('/auth/info', auth, controller.auth.info)
    backendRouter.patch('/auth/info', auth, controller.auth.update)
    backendRouter.patch('/auth/password', auth, controller.auth.password)

    // Notification
    backendRouter.get('/notifications', auth, controller.notification.list)
    backendRouter.patch('/notifications/view', auth, controller.notification.viewAll)
    backendRouter.patch('/notifications/:id/view', auth, controller.notification.view)
    backendRouter.delete('/notifications/:id', auth, controller.notification.delete)
}
