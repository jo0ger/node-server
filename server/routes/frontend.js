/**
 * @desc front api map
 * @author Jooger <zzy1198258955@163.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const {
	article,
	category,
	tag,
	comment,
	music,
	option,
	user,
	auth,
	moment
} = require('../controller')
const { authenticate } = require('../middleware')
const isSnsAuthenticated = authenticate.isSnsAuthenticated()
const snsAuth = authenticate.snsAuth
const snsLogout = authenticate.snsLogout()

// Article
router.get('/articles', article.list)
router.get('/articles/:id', article.item)
router.post('/articles/:id/like', article.like)

// Comment
router.get('/comments', comment.list)
router.get('/comments/:id', comment.item)
router.post('/comments', comment.create)
router.post('/comments/:id/like', comment.like)

// Tag
router.get('/tags', tag.list)
router.get('/tags/:id', tag.item)

// Category
router.get('/categories', category.list)
router.get('/categories/:id', category.item)

// Music
router.get('/music/songs', music.list)
router.get('/music/songs/:song_id', music.item)
router.get('/music/songs/:song_id/url', music.url)
router.get('/music/songs/:song_id/lyric', music.lyric)

// Option
router.get('/options', option.data)

// User
router.get('/users/me', user.me)
router.get('/users/:id', isSnsAuthenticated, user.item)

// Auth
router.get('/auth/logout', isSnsAuthenticated, auth.logout)
router.get('/auth/github/login', snsAuth('github'))
      .get('/callback', auth.githubLogin)

// Moment
router.get('/moments', moment.list)

module.exports = router
