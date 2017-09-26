/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const articleCtrl = require('../controller/article')

router.get('/articles', articleCtrl.list)
router.get('/articles/:id', articleCtrl.item)

module.exports = router
