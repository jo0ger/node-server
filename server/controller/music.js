/**
 * @desc Music controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const NeteseMusic = require('simple-netease-cloud-music')
const { fetchNE } = require('../service')
const { OptionModel } = require('../model')
const debug = require('../util').setDebug('music')

const neteaseMusic = new NeteseMusic()

let songListMap = {}

exports.list = async (ctx, next) => {
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

    const musicId = option.musicId

    if (songListMap[musicId] && songListMap[musicId].length) {
      return ctx.success(songListMap[musicId])
    }

    const data = await fetchSonglist(musicId)
    songListMap[musicId] = data
    ctx.success(data)
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

async function fetchSonglist (playListId) {
  return fetchNE('playlist', playListId).then(({ playlist }) => {
    return Promise.all(
      !playlist ? [] : playlist.tracks.map(({ name, id, ar, al, dt, tns }) => {
        return Promise.all([
          neteaseMusic.url(id),
          neteaseMusic.lyric(id)
        ])
        .then(([song, lyric]) => [song.data[0] || null, lyric.nolyric ? '' : lyric.lrc.lyric])
        .then(([song, lyric]) => {
          return {
            id,
            name,
            duration: dt || 0,
            album: al && {
              name: al.name,
              cover: al.picUrl,
              tns: al.tns
            } || {},
            artists: ar && ar.map(({ id, name }) => ({ id, name })) || [],
            tns: tns || [],
            src: song.url,
            lyric
          }
        })
      }
    ))
  }).catch(err => {
    debug.error(err.message)
    return []
  })
}

// 更新song list cache
exports.updateSongListMap = async function () {
  debug('timed update music...')

  const option = await OptionModel.findOne({}).exec().catch(err => {
    debug.error(err.message)
    return null
  })

  if (option && option.musicId) {
    songListMap[option.musicId] = null
  } else {
    debug('music playlist id is not found')
    return
  }

  const ids = Object.keys(songListMap)
  const list = await Promise.all(ids.map(playListId => fetchSonglist(playListId)))
    .catch(err => debug.error('timed update music failed, err: ', err.message))

  if (list && list.length === ids.length) {
    ids.map((id, index) => {
      songListMap[id] = list[index]
    })
    debug.success('timed update music success...')
  }
}

// 每10分钟更新一次
setInterval(exports.updateSongListMap, 1000 * 60 * 10)
