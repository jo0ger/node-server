/**
 * @desc Article model proxy
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Jan 2018
 */

'use strict'

const { ArticleModel } = require('../model')

module.exports = class ArticleProxy {
  static newAndSave (docs) {
    if (!Array.isArray(docs)) {
      docs = [docs]
    }
    return ArticleModel.insertMany(docs)
  }

  static paginate (query, opt = {}) {
    return ArticleModel.paginate(query, opt)
  }

  static getById (articleId) {
    return ArticleModel.findById(articleId)
  }

  static find (query = {}, opt = {}) {
    return ArticleModel.find(query, null, opts)
  }

  static findOne (query = {}, opt = {}) {
    return ArticleModel.findOne(query, null, opt)
  }

  static updateById (id, doc, opt = {}) {
    return ArticleModel.findByIdAndUpdate(id, doc, {
      new: true,
      ...opt
    })
  }

  static updateOne (query = {}, doc = {}, opt = {}) {
    return ArticleModel.findOneAndUpdate(query, doc, {
      new: true,
      ...opt
    })
  }

  static updateMany (query = {}, doc = {}, opt = {}) {
    return ArticleModel.update(query, doc, {
      multi: true,
      ...opt
    })
  }

  static del (query) {
    return ArticleModel.remove(query)
  }

  static delById (articleId) {
    return this.del({ _id: articleId })
  }

  static delByIds (articleIds) {
    return this.del({
      _id: {
        $in: articleIds
      }
    })
  }
}
