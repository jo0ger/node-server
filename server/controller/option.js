/**
 * @desc Option controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const { OptionModel } = require('../model')

exports.data = async (ctx, next) => {
  const data = await OptionModel.findOne().exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.update = async (ctx, next) => {
  const option = ctx.request.body

  const data = await OptionModel.findOneAndUpdate({}, option, { new: true }).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  console.log(data)

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}
