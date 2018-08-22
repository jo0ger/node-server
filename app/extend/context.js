module.exports = {
    validateObjectId (data, required) {
        return this.validate({
            id: {
                type: 'objectId',
                required
            }
        }, data)
    }
}