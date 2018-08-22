const path = require('path')

module.exports = app => {
    const directory = path.join(app.config.baseDir, 'app/utils')
    app.loader.loadToApp(directory, 'utils')
    app.validator.addRule('objectId', (rule, val) => {
        const valid = app.utils.validate.isObjectId(val)
        if (!valid) {
            return 'must be objectId'
        }
    })
}