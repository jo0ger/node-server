const utils = require('../utils')

const UTILS = Symbol('Application@utils')

module.exports = {
    get utils () {
        if (!this[UTILS]) {
            this[UTILS] = utils
        }
        return this[UTILS]
    }
}