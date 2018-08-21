const { Service } = require('egg')
const ProxyService = require('./proxy')

module.exports = class TagService extends ProxyService {
    get model () {
        return this.app.model.Tag
    }
}
