/**
 * @desc Music controller
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const config = require('../config')
const { modelUpdate, netease } = require('../service')
const { optionProxy } = require('../proxy')
const { proxy, getDebug } = require('../util')
const { redis } = require('../plugins')
const isProd = process.env.NODE_ENV === 'production'
const debug = getDebug('Music')

exports.list = async (ctx, next) => {
  // 后台实时获取
  if (ctx._isAuthenticated) {
    const playListId = ctx.validateQuery('play_list_id')
      .required('the "play_list_id" parameter is required')
      .notEmpty()
      .isString('the "play_list_id" parameter should be String type')
      .val()

    const data = await modelUpdate.fetchSonglist(playListId)
    ctx.success(data)
  } else {
    const option = await optionProxy.findOne().exec().catch(err => {
      ctx.log.error(err.message)
      return null
    })

    if (!option || !option.musicId) {
      return ctx.fail('歌单未找到')
    }

    const playListId = option.musicId
    const musicData = await redis.get(config.constant.redisCacheKey.music)

    // hit
    if (musicData && musicData.id === playListId) {
      return ctx.success(musicData.data || [])
    }

    // update cache
    const data = await modelUpdate.updateMusicCache(playListId)
    ctx.success(data && data.data || {})
  }
}

exports.item = async (ctx, next) => {
  const songId = ctx.validateParam('song_id')
    .required('the "song_id" parameter is required')
    .notEmpty()
    .isString('the "song_id" parameter should be String type')
    .val()

  const { songs } = await netease.neteaseMusic.song(songId)

  ctx.success(songs)
}

exports.url = async (ctx, next) => {
  const songId = ctx.validateParam('song_id')
  .required('the "song_id" parameter is required')
  .notEmpty()
  .isString('the "song_id" parameter should be String type')
  .val()

  const data = await netease.neteaseMusic.url(songId).then(data => {
    if (!isProd) {
      return data.data || []
    }
    if (isType(data.data, 'Array')) {
      return data.data.map(item => {
        item.url = proxy(item.url)
        return item
      })
    }
    return []
  })

  ctx.success(data)
}

exports.lyric = async (ctx, next) => {
  const songId = ctx.validateParam('song_id')
  .required('the "song_id" parameter is required')
  .notEmpty()
  .isString('the "song_id" parameter should be String type')
  .val()

  const data = await netease.neteaseMusic.lyric(songId)

  ctx.success(data)
}

exports.cover = async (ctx, next) => {
  const coverId = ctx.validateParam('cover_id')
  .required('the "cover_id" parameter is required')
  .notEmpty()
  .isString('the "cover_id" parameter should be String type')
  .val()

  const data = await netease.neteaseMusic.picture(coverId)

  ctx.success(data)
}
