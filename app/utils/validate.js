const validator = require('validator')

exports.isType = (obj = {}, type = 'Object') => {
	if (!Array.isArray(type)) {
		type = [type]
	}
	return type.some(t => {
		if (typeof t !== 'string') {
			return false
		}
		return Object.prototype.toString.call(obj) === `[object ${t}]`
	})
}

exports.isObjectId = (str = '') => mongoose.Types.ObjectId.isValid(str)

Object.keys(validator).forEach(key => {
	exports[key] = function () {
		return validator[key].apply(validator, arguments)
	}
})

exports.isSiteUrl = (site = '') => validator.isURL(site, {
	protocols: ['http', 'https'],
	require_protocol: true
})
