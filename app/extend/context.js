const geoip = require('geoip-lite')

module.exports = {
    processPayload (payload) {
        if (!payload) return null
        const result = {}
        for (const key in payload) {
            if (payload.hasOwnProperty(key)) {
                const value = payload[key]
                if (value !== undefined) {
                    result[key] = value
                }
            }
        }
        return result
    },
    validateParams (rules) {
        this.validate(rules, this.params)
        return this.params
    },
    validateBody (rules, body, dry = true) {
        if (typeof body === 'number') {
            dry = body
            body = this.request.body
        } else {
            body = body || this.request.body
        }
        this.validate(rules, body)
        return dry && Object.keys(rules).reduce((res, key) => {
            if (body.hasOwnProperty(key)) {
                res[key] = body[key]
            }
            return res
        }, {}) || body
    },
    validateParamsObjectId () {
        return this.validateParams({
            id: {
                type: 'objectId',
                required: true
            }
        })
    },
    validateCommentAuthor (author) {
        author = author || this.request.body.author
        const { isObjectId, isObject } = this.app.utils.validate
        if (isObject(author)) {
            this.validate({
                name: 'string',
                email: 'string'
            }, author)
        } else if (!isObjectId(author)) {
            this.throw(422, '发布人不存在')
        }
    },
    async getLocation () {
        const req = this.req
        const ip = (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            req.ip ||
            req.ips[0] || '').replace('::ffff:', '')
        let location = {}
        const { success, data } = await this.service.aliApi.lookupIp(ip)
        if (success) {
            location = data
        } else {
            location = geoip.lookup(ip) || {}
        }
        return { ip, location }
    }
}
