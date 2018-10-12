'use strict'

const path = require('path')

// had enabled by egg
// exports.static = true

exports.cors = {
    enable: true,
    package: 'egg-cors'
}

exports.mongoose = {
    enable: true,
    package: 'egg-mongoose'
}

exports.validate = {
    enable: true,
    package: 'egg-validate',
}

exports.console = {
    enable: true,
    package: 'egg-console'
}

exports.redis = {
    enable: true,
    package: 'egg-redis'
}

exports.routerPlus = {
    enable: true,
    package: 'egg-router-plus'
}

exports.akismet = {
    enable: true,
    path: path.join(__dirname, '../app/lib/plugin/egg-akismet')
}

exports.mailer = {
    enable: true,
    path: path.join(__dirname, '../app/lib/plugin/egg-mailer')
}
