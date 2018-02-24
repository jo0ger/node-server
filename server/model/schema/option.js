/**
 * @desc Option schema
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema({
	welcome: { type: String, default: '' },
	description: { type: String, default: '' },
	hobby: { type: String, default: '' },
	skill: { type: String, default: '' },
	music: { type: String, default: '' },
	location: { type: String, default: '' },
	company: { type: String, default: '' },
	links: [{
		name: { type: String, required: true },
		github: { type: String, default: '' },
		avatar: { type: String, default: '' },
		slogan: { type: String, default: '' },
		site: { type: String, required: true }
	}],
	musicId: { type: String, default: '' }
})

module.exports = optionSchema
