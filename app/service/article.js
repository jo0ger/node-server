/**
 * @desc Article Services
 */

const ProxyService = require('./proxy')
 
module.exports = class ArticleService extends ProxyService {
    get model () {
        return this.app.model.Article
    }

    get rules () {
        return {
            // todo
        }
    }
}
