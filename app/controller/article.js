/**
 * @desc 文章 Controller
 */

const { Controller } = require('egg')

module.exports = class ArticleController extends Controller {
    async list () {
        const { ctx } = this
        const data = await this.service.article.list()
        data
            ? ctx.success(data, '文章列表获取成功')
            : ctx.fail('文章列表获取失败')
    }

    async item () {
        const { ctx } = this
        const data = await this.service.article.item()
        data
            ? ctx.success(data, '文章详情获取成功')
            : ctx.fail('文章详情获取失败')
    }

    async create () {
        const { ctx } = this
        const data = await this.service.article.create()
        data
            ? ctx.success(data, '文章创建成功')
            : ctx.fail('文章创建失败')
    }

    async update () {
        const { ctx } = this
        const data = await this.service.article.update()
        data
            ? ctx.success(data, '文章更新成功')
            : ctx.fail('文章更新失败')
    }

    async delete () {}

    async like () {
        const { ctx } = this
        const data = await this.service.article.update()
        data
            ? ctx.success(data, '文章点赞成功')
            : ctx.fail('文章点赞失败')
    }

    async archives () {
        this.ctx.success(await this.service.article.archives(), '归档获取成功')
    }
}
