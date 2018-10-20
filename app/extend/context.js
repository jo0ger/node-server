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
    getCtxIp () {
        const req = this.req
        return (req.headers['x-forwarded-for']
            || req.headers['x-real-ip']
            || req.connection.remoteAddress
            || req.socket.remoteAddress
            || req.connection.socket.remoteAddress
            || req.ip
            || req.ips[0]
            || ''
        ).replace('::ffff:', '')
    },
    async getLocation () {
        const ip = this.getCtxIp()
        return await this.service.agent.lookupIp(ip)
    },
    success (data = null, message) {
        const { codeMap } = this.app.config
        const successMsg = codeMap[200]
        message = message || successMsg
        if (this.app.utils.validate.isString(data)) {
            message = data
            data = null
        }
        this.status = 200
        this.body = {
            code: 200,
            success: true,
            message,
            data
        }
    },
    fail (code = -1, message = '', error = null) {
        const { codeMap } = this.app.config
        const failMsg = codeMap[-1]
        if (this.app.utils.validate.isString(code)) {
            error = message || null
            message = code
            code = -1
        }
        const body = {
            code,
            success: false,
            message: message || codeMap[code] || failMsg
        }
        if (error) body.error = error
        this.status = code === -1 ? 200 : code
        this.body = body
    }
}
