/**
 * @desc Http url replace to "/proxy/..."
 * @author Jooger <iamjooger@gmail.com>
 * @date 20 Oct 2017
 */

const config = require('../config')
const prefix = 'http://'

module.exports = (url = '') => {
	if (url.startsWith(prefix)) {
		return url.replace(prefix, `${config.site}/proxy/`)
	}
	return url
}
