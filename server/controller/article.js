/**
 * @desc Article controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const { ArticleModel } = require('../model')
const ctrl = {
  frontend: {},
  backend: {}
}

ctrl.frontend.list = async (ctx, next) => {
  ctx.success('123')
}

ctrl.frontend.item = async (ctx, next) => {
  ctx.success('222')
}

ctrl.backend.list = async (ctx, next) => {
  ctx.success('123')
}

ctrl.backend.item = async (ctx, next) => {
  ctx.success('222')
}

ctrl.backend.create = async (ctx, next) => {}

ctrl.backend.update = async (ctx, next) => {}

ctrl.backend.delete = async (ctx, next) => {}

module.exports = ctrl
