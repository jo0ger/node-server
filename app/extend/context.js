module.exports = {
    validateObjectId (data, required) {
        return this.validate({
            id: {
                type: 'objectId',
                required
            }
        }, data)
    },
    validateBody (rules, body) {
        this.validate(rules, body || this.request.body)
        return Object.keys(rules).reduce((res, key) => {
            if (body.hasOwnProperty(key)) {
                res[key] = body[key]
            }
            return res
        }, {})
    }
}
