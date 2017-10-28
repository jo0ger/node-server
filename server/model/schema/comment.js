/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const commentSchema = new mongoose.Schema({
  // 评论通用项
  createdAt: { type: Date, default: Date.now }, // 创建时间
  updatedAt: { type: Date, default: Date.now }, // 修改时间
  content: { type: String, required: true, validate: /\S+/ }, // 评论内容
  renderedContent: { type: String, required: true, validate: /\S+/ }, // marked渲染后的内容
  state: { type: Number, default: 1 },  // 状态 -2 垃圾评论 | -1 已删除 | 0 待审核 | 1 通过
  akimetSpam: { type: Boolean, default: false },  // Akismet判定是否是垃圾评论，方便后台check
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ups: { type: Number, default: 0 }, // 点赞数
  sticky: { type: Number, default: 0 }, // 是否置顶 0 否 | 1 是
  type: { type: Number, default: 0 }, // 类型 0 文章评论 | 1 其他（保留）
  meta: {
    ip: String, // 用户IP
    location: Object,  // IP所在地
    ua: { type: String, validate: /\S+/ }, // user agent
    referer: { type: String, default: '' }
  } ,
  // type为0时此项存在
  article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  // 子评论具备项
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // 父评论 parent和forward二者必须同时存在
  forward: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }  // 前一条评论ID，可以是parent的id， 比如 B评论 是 A评论的回复，则B.forward._id = A._id，主要是为了查看评论对话时的评论树构建
})

commentSchema.plugin(mongoosePaginate)

module.exports = commentSchema
