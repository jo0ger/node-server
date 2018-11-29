/**
 * @desc 说说 Services
 */

const ProxyService = require('./proxy')

module.exports = class MomentService extends ProxyService {
    get model () {
        return this.app.model.Moment
    }
}
