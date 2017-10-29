/**
 * @desc Music controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const NeteseMusic = require('simple-netease-cloud-music')
const config = require('../config')
const { fetchNE } = require('../service')
const { OptionModel } = require('../model')
const { proxy, getDebug } = require('../util')
const { redis } = require('../plugins')

const isProd = process.env.NODE_ENV === 'production'
const debug = getDebug('Music')
const neteaseMusic = new NeteseMusic()
const cacheKey = 'musicData'

exports.list = async (ctx, next) => {
  // 后台实时获取
  if (ctx._isAuthenticated) {
    const playListId = ctx.validateQuery('play_list_id')
      .required('the "play_list_id" parameter is required')
      .notEmpty()
      .isString('the "play_list_id" parameter should be String type')
      .val()

    const data = await fetchSonglist(playListId)
    ctx.success(data)
  } else {
    const option = await OptionModel.findOne({}).exec().catch(err => {
      ctx.log.error(err.message)
      return null
    })

    if (!option || !option.musicId) {
      return ctx.fail()
    }

    const playListId = option.musicId
    const musicData = await redis.get(cacheKey)

    // hit
    if (musicData && musicData.id === playListId) {
      return ctx.success(musicData.list || [])
    }

    // update cache
    const data = await exports.updateMusicCache(playListId)
    ctx.success(data.list)
  }
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
  const songId = ctx.validateParam('song_id')
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

// 获取除了歌曲链接和歌词外其他信息
function fetchSonglist (playListId) {
  return neteaseMusic.playlist(playListId).then(({ playlist }) => {
    return !playlist ? [] : playlist.tracks.map(({ name, id, ar, al, dt, tns }) => {
      return {
        id,
        name,
        duration: dt || 0,
        album: al && {
          name: al.name,
          cover: isProd ? (al.picUrl ? `${config.site}${proxy(al.picUrl)}` : '') : al.picUrl,
          tns: al.tns
        } || {},
        artists: ar && ar.map(({ id, name }) => ({ id, name })) || [],
        tns: tns || []
      }
    })
  }).catch(err => {
    debug.error('歌单列表获取失败，错误：', err.message)
    return []
  })
}

// 更新song list cache
let lock = false
exports.updateMusicCache = async function (playListId = '') {
  if (lock) {
    debug.warn('缓存更新中...')
    return
  }
  lock = true
  if (!playListId) {
    const option = await OptionModel.findOne({}).exec().catch(err => {
      debug.error('Option查找失败，错误：', err.message)
      return null
    })

    if (!option || !option.musicId) {
      return debug.warn('歌单ID未配置')
    }
    playListId = option.musicId
  }

  const data = await fetchSonglist(playListId)
  const set = {
    id: playListId,
    list: data
  }

  redis.set(cacheKey, set).then(() => {
    debug.success('缓存更新成功，歌单ID：', playListId)
  }).catch(err => {
    debug.error('缓存更新失败，歌单ID：%s，错误：%s', playListId, err.message)
  })

  lock = false
  return set
}
