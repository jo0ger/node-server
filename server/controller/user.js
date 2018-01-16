/**
 * @desc User controlelr
 * @author Jooger <iamjooger@gmail.com>
 * @date 26 Sep 2017
 */

'use strict'

const config = require('../config')
const { UserModel, CommentModel } = require('../model')
const { bhash, bcompare, getDebug, proxy } = require('../util')
const { getGithubUsersInfo } = require('../service')
const debug = getDebug('User')

exports.list = async (ctx, next) => {
  let select = '-password'

  if (!ctx._isAuthenticated) {
    select += ' -createdAt -updatedAt -role'
  }

  const data = await UserModel.find({})
    .sort('-createdAt')
    .select(select)
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.item = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  let select = '-password'

  if (!ctx._isAuthenticated) {
    select += ' -createdAt -updatedAt -github'
  }

  const data = await UserModel.findById(id)
    .select(select)
    .exec()
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.update = async (ctx, next) => {
  const name = ctx.validateBody('name').optional().isString('the "name" parameter should be String type').val()
  const email = ctx.validateBody('email').optional().isString('the "email" parameter should be String type').isEmail('Invalid email format').val()
  const site = ctx.validateBody('site').optional().isString('the "site" parameter should be String type').val()
  const description = ctx.validateBody('description').optional().isString('the "description" parameter should be String type').val()
  const avatar = ctx.validateBody('avatar').optional().isString('the "avatar" parameter should be String type').val()
  const slogan = ctx.validateBody('slogan').optional().isString('the "slogan" parameter should be String type').val()
  const role = ctx.validateBody('role').optional().toInt().isIn(Object.values(config.roleMap), 'the "role" parameter is not the expected value').val()
  const password = ctx.validateBody('password').optional().isString('the "password" parameter should be String type').val()
  const mute = ctx.validateBody('mute').optional().toBoolean().val()
  const user = {}

  name && (user.name = name)
  slogan && (user.slogan = slogan)
  site && (user.site = site)
  description && (user.description = description)
  avatar && (user.avatar = avatar)
  email && (user.email = email)

  if (role !== undefined) {
    user.role = role
  }

  if (mute !== undefined) {
    user.mute = mute
  }

  if (password !== undefined) {
    const oldPassword = ctx.validateBody('old_password')
      .required('the "old_password" parameter is required')
      .notEmpty()
      .isString('the "old_password" parameter should be String type')
      .val()

    const vertifyPassword = bcompare(oldPassword, ctx._user.password)
    if (!vertifyPassword) {
      return ctx.fail(-1, 'old password is not correct')
    }
    user.password = bhash(password)
  }

  const data = await UserModel.findByIdAndUpdate(ctx._user._id, user, {
    new: true
  }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.delete = async (ctx, next) => {
  const id = ctx.validateParam('id').required('the "id" parameter is required').toString().isObjectId().val()
  const data = await UserModel.remove({ _id: id }).catch(err => {
    ctx.log.error(err.message)
    return null
  })

  if (data && data.result && data.result.ok) {
    ctx.success()
  } else {
    ctx.fail()
  }
}

exports.blogger = async (ctx, next) => {
  const data = await UserModel
    .findOne({ 'github.login': config.author, role: 0 })
    .select('-password -role -createdAt -updatedAt -github -mute')
    .exec()
    .catch(err => {
      ctx.log.error(err.message)
      return null
    })

  if (data) {
    ctx.success(data)
  } else {
    ctx.fail()
  }
}

exports.guests = async (ctx, next) => {
  // $lookup尝试失败，只能循环查询用户了
  let data = await CommentModel.aggregate([
    {
      $sort: {
        createdAt: -1
      }
    },
    {
      $group: {
        _id: '$author'
      }
    }
  ])
  let list = await Promise.all((data || []).map((item) => {
    return UserModel.findOne({
      _id: item._id,
      $nor: [
        {
          role: config.roleMap.ADMIN
        }, {
          'github.login': config.author
        }
      ]
    }).select('name site avatar')
  }))
  list = list.filter(item => !!item)
  ctx.success({
    list,
    total: list.length
  })
}

// 更新用户的Github信息
exports.updateGithubInfo = async () => {
  const users = await UserModel.find({})
    .exec()
    .catch(err => {
      debug.error('用户查找失败，错误：', err.message)
      return []
    })
  const githubUsers = users.reduce((sum, user) => {
    if (user.role === config.roleMap.GITHUB_USER || (user.role === config.roleMap.ADMIN && user.github.login)) {
      sum.push(user)
    }
    return sum
  }, [])
  const updates = await getGithubUsersInfo(githubUsers.map(user => user.github.login))
  Promise.all(
    updates.reduce((tasks, data, index) => {
      console.log(data)
      const user = githubUsers[index]
      const u = {
        name: data.name,
        email: data.email,
        avatar: proxy(data.avatar_url),
        site: data.blog || data.url,
        slogan: data.bio,
        company: data.company,
        location: data.location,
        github: {
          id: data.id,
          login: data.login
        }
      }
      tasks.push(
        UserModel.findByIdAndUpdate(user._id, u).exec().catch(err => {
          debug.error('Github用户信息更新失败，错误：', err.message)
          return null
        })
      )
      return tasks
    }, [])
  ).then(() => {
    debug.success('所有Github用户信息更新成功')
  })
}
