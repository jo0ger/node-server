const mongoose = require('mongoose')

exports.noop = function () {}

// 首字母大写
exports.firstUpperCase = (str = '') => str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase())

exports.createObjectId = (id = '') => {
	return id ? mongoose.Types.ObjectId(id) : mongoose.Types.ObjectId()
}
