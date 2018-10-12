/**
 * @desc gravatar头像
 */

const gravatar = require('gravatar')

module.exports = app => {
    return (email = '', opt = {}) => {
        if (!app.utils.validate.isEmail(email)) {
            return app.config.defaultAvatar
        }
        const protocol = `http${app.config.isProd ? 's' : ''}`
        const url = gravatar.url(email, Object.assign({
            s: '100',
            r: 'x',
            d: 'retro',
            protocol
        }, opt))
        return url && url.replace(`${protocol}://`, `${app.config.author.url}/proxy/`) || app.config.defaultAvatar
    }
}
