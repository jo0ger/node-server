/**
 * @desc Music controller
 * @author Jooger <zzy1198258955@163.com>
 * @date 26 Sep 2017
 */

'use strict'

const NeteseMusic = require('simple-netease-cloud-music')
// const { fetchNE } = require('../service')
const { OptionModel } = require('../model')
const debug = require('../util').setDebug('music')

const neteaseMusic = new NeteseMusic()

let songListMap = {}

exports.list = async (ctx, next) => {
  // const playListId = ctx.validateQuery('play_list_id')
  //   .required('the "play_list_id" parameter is required')
  //   .notEmpty()
  //   .isString('the "play_list_id" parameter should be String type')
  //   .val()

  const option = await OptionModel.findOne({}).exec().catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (!option) {
    return ctx.fail()
  }

  const musicId = option.musicId
  if (songListMap[musicId]) {
    return ctx.success(songListMap[musicId])
  }
  
  const data = await fetchSonglist(musicId)
  songListMap[musicId] = data
  ctx.success(data)
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

// TEST
// exports.test = async (ctx, next) => {
//   const playListId = ctx.validateQuery('play_list_id')
//     .required('the "play_list_id" parameter is required')
//     .notEmpty()
//     .isString('the "play_list_id" parameter should be String type')
//     .val()
//   const tracks = await fetchNE('playlist', playListId)
//     .then(({ playlist }) => {
//       return playlist.tracks.map(({ name, id, ar, al, dt, tns }) => ({
//         id,
//         name,
//         duration: dt,
//         artists: ar.map(({ id, name }) => ({ id, name })),
//         album: {
//           name: al.name,
//           cover: al.picUrl,
//           tns: al.tns
//         },
//         tns: tns || []
//       }))
//     })
//   ctx.success(tracks)
// }

async function fetchSonglist (playListId) {
  return neteaseMusic.playlist(playListId).then(({ playlist }) => {
    return Promise.all(
      playlist.tracks.map(track => {
        return Promise.all([
          neteaseMusic.url(track.id),
          neteaseMusic.lyric(track.id)
        ])
        .then(([song, lyric]) => [song.data[0] || null, lyric.nolyric ? '' : lyric.lrc.lyric])
        .then(([song, lyric]) => {
          const { id, name, dt, al, ar } = track
          return {
            id,
            name,
            duration: dt || 0,
            album: al || {},
            artists: ar || [],
            src: song.url,
            lyric
          }
        })
      }
    ))
  })
}

// 每1小时更新一次
setInterval(updateSongListMap, 1000 * 60 * 60)
setTimeout(updateSongListMap, 0)

// 更新song list cache
async function updateSongListMap () {
  debug('timed update music...')

  const option = await OptionModel.findOne({}).exec().catch(err => {
    debug.error(err.message)
    return null
  })

  if (option && option.musicId) {
    songListMap[option.musicId] = null
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

exports.updateSongListMap = updateSongListMap
