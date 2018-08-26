/**
 * @desc 评论 Controller
 */

const { Controller } = require('egg')

module.exports = class CommentController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.comment.list()
        data
            ? ctx.success(data, '评论列表获取成功')
            : ctx.fail('评论列表获取失败')
    }

    async item () {
        const { ctx } = this
        const data = await this.service.comment.item()
        data
            ? ctx.success(data, '评论详情获取成功')
            : ctx.fail('评论详情获取失败')
    }

    async create () {
        const data = await this.service.comment.create()
        if (data) {
            if (data.type === this.config.modelValidate.comment.type.optional.COMMENT) {
                // 如果是文章评论，则更新文章评论数量
                this.service.article.updateArticleCommentCount(data.article)
            }
            // 发送邮件通知站主和被评论者
            this.service.comment.sendCommentEmailToAdminAndUser(data)
        }
    }

    async update () {
        await this.service.comment.update()
    }

    async delete () {
        const { ctx } = this
        const data = await this.service.comment.delete()
        data
            ? ctx.success('评论删除成功')
            : ctx.fail('评论删除失败')
    }

    async like () {
        const { ctx } = this
        const data = await this.service.comment.update()
        data
            ? ctx.success(data, '评论点赞成功')
            : ctx.fail('评论点赞失败')
    }
}
