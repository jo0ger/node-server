/**
 * @desc 
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const { article, music } = require('../controller')

// Article
router.get('/articles', article.list)
router.get('/articles/:id', article.item)
router.get('/articles/:id/like', article.like)

// Music
router.get('/music/songs', music.list)
router.get('/music/songs/:song_id', music.item)
router.get('/music/songs/:song_id/url', music.url)
router.get('/music/songs/:song_id/lyric', music.lyric)
router.get('/music/songs/cover/:cover_id', music.cover)

module.exports = router
