const geoip = require('geoip-lite')

module.exports = {
    validateParams (rules) {
        this.validate(rules, this.params)
        return this.params
    },
    validateBody (rules, body) {
        body = body || this.request.body
        this.validate(rules, body)
        return Object.keys(rules).reduce((res, key) => {
            if (body.hasOwnProperty(key)) {
                res[key] = body[key]
            }
            return res
        }, {})
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
                email: 'string',
                site: { type: 'string', required: false }
            }, author)
        } else if (!isObjectId(author)) {
            this.throw(422, '发布人不存在')
        }
    },
    getLocation () {
        const req = this.req
        const ip = (req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            req.ip ||
            req.ips[0] || '').replace('::ffff:', '')
        return {
            ip,
            location: geoip.lookup(ip) || {}
        }
    }
}
