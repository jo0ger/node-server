/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const articleCtrl = require('../controller/article')

router.get('/articles', articleCtrl.frontend.list)
router.get('/articles/:id', articleCtrl.frontend.item)

module.exports = router
