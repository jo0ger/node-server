const lodash = require('lodash')
const mongoose = require('mongoose')
const validator = require('validator')

Object.keys(lodash).forEach(key => {
    if (key.startsWith('is')) {
        exports[key] = lodash[key]
    }
})

exports.isEmptyObject = obj => {
    if (typeof obj !== 'object') {
        return false
    }
    /* eslint-disable */
    for (let key in obj) {
        return false
    }
    return true
}

exports.isObjectId = (str = '') => mongoose.Types.ObjectId.isValid(str)

Object.keys(validator).forEach(key => {
    exports[key] = function () {
        return validator[key].apply(validator, arguments)
    }
})

exports.isUrl = (site = '') => {
    if (!site) return true
    return validator.isURL(site, {
        protocols: ['http', 'https'],
        require_protocol: true
    })
}
