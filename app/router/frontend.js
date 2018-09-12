module.exports = app => {
    const fontendRouter = app.router.namespace('/v2')
    const { controller } = app

    // Article
    fontendRouter.get('/articles', controller.article.list)
    fontendRouter.get('/articles/archives', controller.article.archives)
    fontendRouter.get('/articles/:id', controller.article.item)
    fontendRouter.patch('/articles/:id', controller.article.like)
    fontendRouter.patch('/articles/:id/like', controller.article.like)
    fontendRouter.patch('/articles/:id/unlike', controller.article.unlike)

    // Category
    fontendRouter.get('/categories', controller.category.list)
    fontendRouter.get('/categories/:id', controller.category.item)

    // Tag
    fontendRouter.get('/tags', controller.tag.list)
    fontendRouter.get('/tags/:id', controller.tag.item)

    // Comment
    fontendRouter.get('/comments', controller.comment.list)
    fontendRouter.get('/comments/:id', controller.comment.item)
    fontendRouter.post('/comments', controller.comment.create)
    fontendRouter.patch('/comments/:id/like', controller.comment.like)
    fontendRouter.patch('/comments/:id/unlike', controller.comment.unlike)

    // User
    fontendRouter.get('/users/:id', controller.user.item)

    // Setting
    fontendRouter.get('/setting', controller.setting.index)
}
