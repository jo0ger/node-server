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
}
