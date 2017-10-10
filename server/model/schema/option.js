/**
 * @desc Option schema
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const mongoose = require('mongoose')

const optionSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  welcome: { type: String, default: '' },
  description: [{ type: String, default: '' }],
  banners: [{ type: String, validate: /.+?\.(jpg|jpeg|gif|bmp|png)/ }],
  errorBanner: { type: String, validate: /.+?\.(jpg|jpeg|gif|bmp|png)/ },
  hobby: [{
    name: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  experience: [{
    time: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' }
  }],
  skill: [{
    title: { type: String, required: true },
    level: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  contact: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, required: true }
  }],
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
