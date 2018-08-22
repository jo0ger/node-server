/**
 * @desc User Services
 */

const ProxyService = require('./proxy')
 
module.exports = class UserService extends ProxyService {
    get model () {
        return this.app.model.User
    }

    get rules () {
        return {
            // todo
        }
    }
}
