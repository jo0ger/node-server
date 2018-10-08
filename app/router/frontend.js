module.exports = app => {
    const frontendRouter = app.router.namespace('')
    const { controller } = app

    // Article
    frontendRouter.get('/articles', controller.article.list)
    frontendRouter.get('/articles/archives', controller.article.archives)
    frontendRouter.get('/articles/hot', controller.article.hot)
    frontendRouter.get('/articles/:id', controller.article.item)
    frontendRouter.patch('/articles/:id', controller.article.like)
    frontendRouter.patch('/articles/:id/like', controller.article.like)
    frontendRouter.patch('/articles/:id/unlike', controller.article.unlike)

    // Category
    frontendRouter.get('/categories', controller.category.list)
    frontendRouter.get('/categories/:id', controller.category.item)

    // Tag
    frontendRouter.get('/tags', controller.tag.list)
    frontendRouter.get('/tags/:id', controller.tag.item)

    // Comment
    frontendRouter.get('/comments', controller.comment.list)
    frontendRouter.get('/comments/:id', controller.comment.item)
    frontendRouter.post('/comments', controller.comment.create)
    frontendRouter.patch('/comments/:id/like', controller.comment.like)
    frontendRouter.patch('/comments/:id/unlike', controller.comment.unlike)

    // User
    frontendRouter.get('/users/:id', controller.user.item)

    // Setting
    frontendRouter.get('/setting', controller.setting.index)

    // Agent
    frontendRouter.get('/agent/hitokoto', controller.agent.hitokoto)
    frontendRouter.get('/agent/ip', controller.agent.ip)
}
