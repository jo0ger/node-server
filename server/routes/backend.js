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
router.post('/articles', auth.isAuthenticated(), articleCtrl.create)
router.patch('/articles/:id', auth.isAuthenticated(), articleCtrl.update)
router.delete('/articles/:id', auth.isAuthenticated(), articleCtrl.delete)
router.get('/articles/:id/like', auth.isAuthenticated(), articleCtrl.like)

module.exports = router
