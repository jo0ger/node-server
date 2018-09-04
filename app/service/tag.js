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
        let tag = await this.model.find(query, select, opt).exec()
        if (tag.length) {
            const PUBLISH = this.app.config.modelEnum.article.state.optional.PUBLISH
            tag = await Promise.all(
                tag.map(async item => {
                    item = item.toObject()
                    const articles = await this.service.article.getList({
                        tag: item._id,
                        state: PUBLISH
                    })
                    item.count = articles.length
                    return item
                })
            )
        }
        return tag
    }
}
