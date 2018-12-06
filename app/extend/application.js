const mongoosePaginate = require('mongoose-paginate-v2')
const lodash = require('lodash')
const merge = require('merge')
const jwt = require('jsonwebtoken')

const prefix = 'http://'
const STORE = Symbol('Application#store')

module.exports = {
    // model schema处理
    processSchema (schema, options = {}, middlewares = {}) {
        if (!schema) {
            return null
        }
        schema.set('versionKey', false)
        schema.set('toObject', { getters: true, virtuals: false })
        schema.set('toJSON', { getters: true, virtuals: false })
        schema.add({
            // 创建日期
            createdAt: { type: Date, default: Date.now },
            // 更新日期
            updatedAt: { type: Date, default: Date.now }
        })
        if (options && options.paginate) {
            schema.plugin(mongoosePaginate)
        }
        schema.pre('findOneAndUpdate', function (next) {
            this._update.updatedAt = Date.now()
            next()
        })
        Object.keys(middlewares).forEach(key => {
            const fns = middlewares[key]
            Object.keys(fns).forEach(action => {
                schema[key](action, fns[action])
            })
        })
        return schema
    },
    merge () {
        return merge.recursive.apply(null, [true].concat(Array.prototype.slice.call(arguments)))
    },
    proxyUrl (url) {
        if (lodash.isString(url) && url.startsWith(prefix)) {
            return url.replace(prefix, `${this.config.author.url}/proxy/`)
        }
        return url
    },
    // 获取分页请求的响应数据
    getDocsPaginationData (docs) {
        if (!docs) return null
        return {
            list: docs.docs,
            pageInfo: {
                total: docs.totalDocs,
                current: docs.page > docs.totalPages ? docs.totalPages : docs.page,
                pages: docs.totalPages,
                limit: docs.limit
            }
        }
    },
    async verifyToken (token) {
        if (token) {
            let decodedToken = null
            try {
                decodedToken = await jwt.verify(token, this.config.secrets)
            } catch (err) {
                this.logger.warn('Token校验出错，错误：' + err.message)
                return false
            }
            if (decodedToken && decodedToken.exp > Math.floor(Date.now() / 1000)) {
                // 已校验权限
                this.logger.info('Token校验成功')
                return true
            }
        }
        return false
    },
    get store () {
        if (!this[STORE]) {
            const app = this
            this[STORE] = {
                async get (key) {
                    const res = await app.redis.get(key)
                    if (!res) return null
                    return JSON.parse(res)
                },
                async set (key, value, maxAge) {
                    if (!maxAge) maxAge = 24 * 60 * 60 * 1000;
                    value = JSON.stringify(value);
                    await app.redis.set(key, value, 'PX', maxAge);
                },
                async destroy (key) {
                    await app.redis.del(key)
                }
            }
        }
        return this[STORE]
    }
}
