/**
 * @desc backend api map
 * @author Jooger <iamjooger@gmail.com>
 * @date 25 Sep 2017
 */

'use strict'

const router = require('koa-router')()
const {
  article,
  category,
  tag,
  comment,
  option,
  user,
  auth,
  music,
  statistics,
  moment
} = require('../controller')
const { authenticate } = require('../middleware')
const isAuthenticated = authenticate.isAuthenticated()

// Article
router.get('/articles', isAuthenticated, article.list)
router.get('/articles/:id', isAuthenticated, article.item)
router.post('/articles',isAuthenticated,  article.create)
router.patch('/articles/:id', isAuthenticated, article.update)
router.delete('/articles/:id', isAuthenticated, article.delete)
router.post('/articles/:id/like', isAuthenticated, article.like)

// Comment
router.get('/comments', isAuthenticated, comment.list)
router.get('/comments/:id', isAuthenticated, comment.item)
router.post('/comments', isAuthenticated, comment.create)
router.patch('/comments/:id', isAuthenticated, comment.update)
router.delete('/comments/:id', isAuthenticated, comment.delete)
router.post('/comments/:id/like', isAuthenticated, comment.like)

// Tag
router.get('/tags', isAuthenticated, tag.list)
router.get('/tags/:id', isAuthenticated, tag.item)
router.post('/tags', isAuthenticated, tag.create)
router.patch('/tags/:id', isAuthenticated, tag.update)
router.delete('/tags/:id', isAuthenticated, tag.delete)

// Category
router.get('/categories', isAuthenticated, category.list)
router.get('/categories/:id', isAuthenticated, category.item)
router.post('/categories', isAuthenticated, category.create)
router.patch('/categories/:id', isAuthenticated, category.update)
router.delete('/categories/:id', isAuthenticated, category.delete)

// Option
router.get('/options', isAuthenticated, option.data)
router.patch('/options', isAuthenticated, option.update)

// User
router.get('/users', isAuthenticated, user.list)
router.get('/users/blogger', isAuthenticated, user.blogger)
router.get('/users/guests', isAuthenticated, user.guests)
router.get('/users/:id', isAuthenticated, user.item)
router.patch('/users/me/password', isAuthenticated, user.password)
router.patch('/users/me', isAuthenticated, user.updateMe)
router.patch('/users/:id/mute', isAuthenticated, user.mute)

// Music
router.get('/music/songs', isAuthenticated, music.list)
router.get('/music/songs/:song_id', isAuthenticated, music.item)
router.get('/music/songs/:song_id/url', isAuthenticated, music.url)
router.get('/music/songs/:song_id/lyric', isAuthenticated, music.lyric)

// Auth
router.get('/auth/local/logout', isAuthenticated, auth.logout)
router.post('/auth/local/login', auth.localLogin)
router.get('/auth/info', isAuthenticated, auth.info)

// Moment
router.get('/moments', isAuthenticated, moment.list)
router.post('/moments', isAuthenticated, moment.create)
router.patch('/moments/:id', isAuthenticated, moment.update)
router.delete('/moments/:id', isAuthenticated, moment.delete)

// Statistics
// TODO:
router.get('/statistics', isAuthenticated, statistics.data)

module.exports = router
