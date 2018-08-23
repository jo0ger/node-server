const bcrypt = require('bcryptjs')

// hash 加密
exports.bhash = (str = '') => bcrypt.hashSync(str, 8)

// 对比
exports.bcompare = bcrypt.compareSync

// 随机字符串
exports.randomString = (length = 8) => {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'
    let id = ''
    for (let i = 0; i < length; i++) {
        id += chars[Math.floor(Math.random() * chars.length)]
    }
    return id
}
