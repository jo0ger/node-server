const mongoose = require('mongoose')

exports.lodash = require('lodash')

exports.noop = function () {}

// 首字母大写
exports.firstUpperCase = (str = '') => str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase())

exports.createObjectId = (id = '') => {
    return id ? mongoose.Types.ObjectId(id) : mongoose.Types.ObjectId()
}

exports.getMonthFromNum = (num = 1) => {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][num - 1] || ''
}
