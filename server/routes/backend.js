/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const articleCtrl = require('../controller/article')
const { auth } = require('../middleware')

router.get('/articles', auth.isAuthenticated(), articleCtrl.list)
router.get('/articles/:id', auth.isAuthenticated(), articleCtrl.item)

module.exports = router
