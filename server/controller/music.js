/**
 * @desc Music controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const NeteseMusic = require('simple-netease-cloud-music')

const neteaseMusic = new NeteseMusic()

exports.list = async (ctx, next) => {
  const playListId = ctx.validateQuery('play_list_id')
    .required('the "play_list_id" parameter is required')
    .notEmpty()
    .isString('the "play_list_id" parameter should be String type')
    .val()

  const { playlist } = await neteaseMusic.playlist(playListId)

  ctx.success(playlist)
}

exports.item = async (ctx, next) => {
  const songId = ctx.validateParam('song_id')
  .required('the "song_id" parameter is required')
  .notEmpty()
  .isString('the "song_id" parameter should be String type')
  .val()

  const { songs } = await neteaseMusic.song(songId)

  ctx.success(songs)
}

exports.url = async (ctx, next) => {
  const songId = ctx.validateParam('song_id')
  .required('the "song_id" parameter is required')
  .notEmpty()
  .isString('the "song_id" parameter should be String type')
  .val()

  const data = await neteaseMusic.url(songId)

  ctx.success(data)
}

exports.lyric = async (ctx, next) => {
  const coverId = ctx.validateParam('song_id')
  .required('the "song_id" parameter is required')
  .notEmpty()
  .isString('the "song_id" parameter should be String type')
  .val()

  const data = await neteaseMusic.lyric(songId)

  ctx.success(data)
}

exports.cover = async (ctx, next) => {
  const coverId = ctx.validateParam('cover_id')
  .required('the "cover_id" parameter is required')
  .notEmpty()
  .isString('the "cover_id" parameter should be String type')
  .val()

  const data = await neteaseMusic.picture(coverId)

  ctx.success(data)
}
