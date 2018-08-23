/**
 * @desc 公共的model proxy service
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
        return this.model.findByIdAndUpdate(id, doc, Object.assign({ new: true }, opt))
    }

    updateOne (query = {}, doc = {}, opt = {}) {
        return this.model.findOneAndUpdate(query, doc, Object.assign({ new: true }, opt))
    }

    updateMany (query = {}, doc = {}, opt = {}) {
        return this.model.update(query, doc, Object.assign({ multi: true }, opt))
    }

    remove (query = {}) {
        return this.model.remove(query)
    }

    deleteById (id = '') {
        return this.model.deleteOne({ _id: id })
    }

    deleteByIds (ids = []) {
        return this.model.deleteMany({
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
