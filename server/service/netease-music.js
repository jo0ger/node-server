/**
 * @desc 网易云音乐 TEST
 * @author Jooger <zzy1198258955@163.com>
 * @date 30 Sep 2017
 */

'use strict'

const axios = require('axios')
const { encrypt, setDebug } = require('../util')
const debug = setDebug('netease')

const neFetcher = axios.create({
  baseURL: 'http://music.163.com',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': 'http://music.163.com',
    'Host': 'music.163.com',
    'Cookie': 'appver=2.0.2;',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36',
  }
})

const links = {
  playlist: '/weapi/v3/playlist/detail',
  song: '/weapi/v3/song/detail',
  songUrl: '/weapi/song/enhance/player/url'
}

const fetchNE = function (type = '', id = '') {
  return new Promise((resolve, reject) => {
    if (!id) {
      return reject(new Error('no id detect'))
    }
    let data = {}

    switch (type) {
      case 'playlist':
        data = {
          id: id,
          offset: 0,
          total: true,
          limit: 1000,
          n: 1000,
          csrf_token: ''
        }
        break
      case 'song':
        data = {
          c: JSON.stringify([{ id }]),
          ids: `[${id}]`,
          csrf_token: ''
        }
        break
      case 'songUrl':
        data = {
          ids: [id],
          br: 999000,
          csrf_token: ''
        }
        break
      case 'songlyric':
        data = {
          id,
          os: 'linux',
          lv: -1,
          kv: -1,
          tv: -1,
        }
        break
      default:
        return reject(new Error('no support type'))
        break
    }

    neFetcher.request({
      method: 'post',
      url: links[type],
      params: encrypt(data)
    }).then(res => {
      if (res && res.status === 200) {
        resolve(res.data)
      } else {
        reject(new Error(res.statusText))
      }
    }).catch(err => {
      debug.error(err.message)
    })
  })
}

module.exports = fetchNE
