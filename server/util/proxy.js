/**
 * @desc Http url proxy replace
 * @author Jooger <zzy1198258955@163.com>
 * @date 20 Oct 2017
 */

const prefix = 'http://'

module.exports = (url = '') => {
	if (url.startsWith(prefix)) {
		return url.replace(prefix, '/proxy/')
	}
	return url
}
