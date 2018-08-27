/**
 * @desc 分类 Services
 */

const ProxyService = require('./proxy2')

module.exports = class CategoryService extends ProxyService {
    get model () {
        return this.app.model.Category
    }

    async getList (query, select = null, opt) {
        opt = this.app.merge({
            sort: '-createdAt'
        }, opt)
        const categories = await this.model.find(query, select, opt).exec()
        if (categories.length) {
            const PUBLISH = this.app.config.modelValidate.article.state.optional.PUBLISH
            await Promise.all(
                categories.map(async item => {
                    const articles = await this.service.article.getList({
                        category: item._id,
                        state: PUBLISH
                    })
                    item.count = articles.length
                })
            )
        }
        return categories
    }

    async getItem (query, select = null, opt) {
        opt = this.app.merge({
            lean: true
        }, opt)
        const category = await this.model.findOne(query, select, opt).exec()
        if (category) {
            category.articles = await this.service.article.getList({ category: category._id })
        }
        return category
    }
}
