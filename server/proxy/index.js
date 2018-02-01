/**
 * @desc Model proxy entrance
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Jan 2018
 */

'use strict'

module.exports = {
	articleProxy: require('./article'),
	categoryProxy: require('./category'),
	tagProxy: require('./tag'),
	userProxy: require('./user'),
	commentProxy: require('./comment'),
	optionProxy: require('./option'),
	momentProxy: require('./moment')
}
