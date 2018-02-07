/**
 * @desc Base model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 27 Jan 2018
 */

'use strict'

module.exports = class BaseProxy {
	constructor (Model) {
		this.Model = Model
	}

	newAndSave (docs) {
		if (!Array.isArray(docs)) {
			docs = [docs]
		}
		return this.Model.insertMany(docs)
	}

	paginate (query, opt = {}) {
		return this.Model.paginate(query, opt)
	}

	getById (id) {
		return this.Model.findById(id)
	}

	find (query = {}, opt = {}) {
		return this.Model.find(query, null, opt)
	}

	findOne (query = {}, opt = {}) {
		return this.Model.findOne(query, null, opt)
	}

	updateById (id, doc, opt = {}) {
		return this.Model.findByIdAndUpdate(id, doc, {
			new: true,
			...opt
		})
	}

	updateOne (query = {}, doc = {}, opt = {}) {
		return this.Model.findOneAndUpdate(query, doc, {
			new: true,
			...opt
		})
	}

	updateMany (query = {}, doc = {}, opt = {}) {
		return this.Model.update(query, doc, {
			multi: true,
			...opt
		})
	}

	del (query = {}) {
		return this.Model.remove(query)
	}

	delById (id = '') {
		return this.del({ _id: id })
	}

	delByIds (ids = []) {
		return this.del({
			_id: {
				$in: ids
			}
		})
	}

	aggregate (opt = {}) {
		return this.Model.aggregate(opt)
	}

	count (query = {}) {
		return this.Model.count(query)
	}
}
