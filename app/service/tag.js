/**
 * @desc 标签 Services
 */

const ProxyService = require('./proxy')

module.exports = class TagService extends ProxyService {
    get model () {
        return this.app.model.Tag
    }

    async getList (query, select = null, opt) {
        opt = this.app.merge({
            sort: '-createdAt'
        }, opt)
        const categories = await this.model.find(query, select, opt).exec()
        if (categories.length) {
            const PUBLISH = this.app.config.modelEnum.article.state.optional.PUBLISH
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
}
