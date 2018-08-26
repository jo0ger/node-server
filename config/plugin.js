'use strict'

const path = require('path')

// had enabled by egg
// exports.static = true

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

exports.akismet = {
    enable: true,
    path: path.join(__dirname, '../app/lib/plugin/egg-akismet')
}
