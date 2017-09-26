/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const { article } = require('../controller')
const { auth } = require('../middleware')

router.get('/articles', auth.isAuthenticated(), article.list)
router.get('/articles/:id', auth.isAuthenticated(), article.item)
router.post('/articles', auth.isAuthenticated(), article.create)
router.patch('/articles/:id', auth.isAuthenticated(), article.update)
router.delete('/articles/:id', auth.isAuthenticated(), article.delete)
router.get('/articles/:id/like', auth.isAuthenticated(), article.like)

module.exports = router
