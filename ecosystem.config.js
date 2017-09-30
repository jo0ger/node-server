/**
 * @desc PM2
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const packageInfo = require('./package.json')

module.exports = {
  apps: {
    name: packageInfo.name,
    script: './bin/www',
    cwd: __dirname,
    watch: true,
    ignore_watch: ['[\/\\]\./', 'node_modules'],
    env: {
      NODE_ENV: 'production'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    out_file: './logs/pm2-out.log',
    error_file: './logs/pm2-error.log',
    pid_file: './logs/jooger.me-server.pid'
  },
  deploy: {
    production: {
      user : 'root',
      host : 'jooger.me',
      ref  : 'origin/master',
      repo : packageInfo.repository.url,
      path : '/root/www/' + packageInfo.name,
      'post-deploy' : 'git pull && cnpm install && pm2 stop all && pm2 reload ecosystem.config.js --env production && pm2 start all'
    }
  }
}
