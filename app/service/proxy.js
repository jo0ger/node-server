/**
 * @desc 公共的model proxy
 */

const { Service } = require('egg')

module.exports = class ProxyService extends Service {
	newAndSave (docs) {
		if (!Array.isArray(docs)) {
			docs = [docs]
		}
		return this.model.insertMany(docs)
	}

	paginate (query, opt = {}) {
		return this.model.paginate(query, opt)
	}

	findById (id) {
		return this.model.findById(id)
	}

	find (query = {}, opt = {}) {
		return this.model.find(query, null, opt)
	}

	findOne (query = {}, opt = {}) {
		return this.model.findOne(query, null, opt)
	}

	updateById (id, doc, opt = {}) {
		return this.model.findByIdAndUpdate(id, doc, {
			new: true,
			...opt
		})
	}

	updateOne (query = {}, doc = {}, opt = {}) {
		return this.model.findOneAndUpdate(query, doc, {
			new: true,
			...opt
		})
	}

	update (query = {}, doc = {}, opt = {}) {
		return this.model.update(query, doc, {
			multi: true,
			...opt
		})
	}

	delete (query = {}) {
		return this.model.remove(query)
	}

	deleteById (id = '') {
		return this.del({ _id: id })
	}

	deleteByIds (ids = []) {
		return this.del({
			_id: {
				$in: ids
			}
		})
	}

	aggregate (opt = {}) {
		return this.model.aggregate(opt)
	}

	count (query = {}) {
		return this.model.count(query)
	}
}