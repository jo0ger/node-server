[C-CLIENT]: https://jooger.me
[S-CLIENT]: https://api.jooger.me
[egg]: https://eggjs.org
[egg-image]: https://img.shields.io/badge/Powered%20By-Egg.js-ff69b4.svg?style=flat-square
[david-image]: https://img.shields.io/david/jo0ger/node-server.svg?style=flat-square
[david-url]: https://david-dm.org/jo0ger/node-server

# node-server

[![powered by Egg.js][egg-image]][egg]
[![David deps][david-image]][david-url]
[![GitHub forks](https://img.shields.io/github/forks/jo0ger/node-server.svg?style=flat-square)](https://github.com/jo0ger/node-server/network)
[![GitHub stars](https://img.shields.io/github/stars/jo0ger/node-server.svg?style=flat-square)](https://github.com/jo0ger/node-server/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/jo0ger/node-server.svg?style=flat-square)](https://github.com/jo0ger/node-server/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/jo0ger/node-server.svg?style=flat-square)](https://github.com/jo0ger/node-server/commits/master)

RESTful API server application for my blog

* Web client for user: [jooger.me]([C-CLIENT]) powered by [Nuxt.js@2](https://github.com/nuxt/nuxt.js) and [TypeScript](https://github.com/Microsoft/TypeScript)
* Web client for admin: vue-admin powered by Vue and iview
* Server client: [api.jooger.me]([S-CLIENT]) powered by [Egg](https://github.com/eggjs/egg) and mongodb

## Quick Start

### Environment Dependencies

- [redis](https://redis.io/)
- [mongodb](https://www.mongodb.com/)

### Development

Please make sure they are configured the same as `config/config.default.js`

``` bash
$ yarn

$ yarn dev

$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
$ npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

### Develop / Deploy with Docker

#### Requirements

* docker
* docker-compose

#### Config

##### docker-compose config

* development: docker-compose.dev.yml
* production: docker-compose.yml

##### Change port

``` yml
version: "3"
services:
  node-server:
    ports:
      - ${HOST PORT}:7001
```

#### Develop

``` bash
#  start
$ docker-compose -f docker-compose.dev.yml up

# stop
$ docker-compose -f docker-compose.dev.yml down

# stop and remove valume/cache
$ docker-compose -f docker-compose.dev.yml down -v
```

#### Deploy

``` bash
# start
$ docker-compose up -d

# stop
$ docker-compose down

# stop and remove volume/cache
$ docker-compose down -v
```

## CHANGELOG

### v2.3.0

* feat: 支持咕咚运动数据抓取、聚合
    * 运动总体数据（总距离、总时长、总次数、总消耗卡路里）
    * 运动记录列表（目前只支持健走、跑步、骑行，其他类型暂不支持，可能后续支持）
    * 运动记录详情（配速、路线、时间、海拔、位置、步数、卡路里、每公里信息等等）
    * 最近 7、30、60、90 天运动数据（次数、距离、时长、消耗卡路里）
* feat: 新增 sport 接口，返回运动数据
* feat: 新增运动数据周、月、季、年维度的数据报告定时生成服务

### v2.2.2

* fix: 后台管理在获取评论列表时把子评论过滤掉了

### v2.2.1

* fix: 备份数据上传失败会邮件通知管理员
* fix: 垃圾评论检测时机有问题
* fix: 文章评论数统计未区分评论状态

### v2.2.0

* feat: 新增管理员检测的接口
* feat: 新增C端公告的接口
* feat: 定时任务新增数据库备份任务，配合jenkins进行数据备份
* feat: 歌单歌曲新增歌词
* fix: 配置里更新歌单ID时，未更新redis缓存
* fix: 评论IP获取错误
* fix: 评论的新用户重复创建
* fix: 歌单定时任务里报undefined错误（因为未考虑抓取失败场景）

### v2.1.0

2018-11-03

* feat: 评论&留言的邮件通知支持自定义模板
* feat: 添加音乐接口，支持网易云音乐
* feat: voice支持redis缓存
* refactor: 移除reponse的中间件，添加到context的extend中

### v2.0.3

2018-10-13

* fix: marked开启sanitize
* fix: marked渲染图片时title错误
* fix: 统计数据-总数统计错误，添加情况分类
* fix: voice获取失败情况处理


### v2.0.2

2018-10-12

* fix: github获取用户信息时clientID和clientSecret错误
* fix: add marked sanitize control
* fix: archive接口的月维度数据排序错误
* fix: 关联文章排序错误

### v2.0.1

2018-10-09

* fix: 获取context的ip错误
* chore: docker添加logs的volume

### v2.0.0

2018-10-07

* 框架：用Egg重构
* Model层
    - article增加原创、转载字段
    - 新增notification站内通知和stat站内统计模型
    - user简化，去掉不必要字段
    - setting重构，分类型
* 接口
    - 新增voice接口获取一些心灵鸡汤文字
    - 新增ip接口查询ip
* 服务
    - ip查询优先阿里云IP查询，geoip-lite为降级
    - 定时任务换成egg的schedule
    - model proxy重构
    - 业务逻辑拆分，每个model都有其对应的service层
    - admin user和setting初始化流程变更
    - 完善的日志系统
* addon
    - 接入sentry
    - docker支持
    - 增加release tag


### v1.1.0

* 文章归档api（2018.01.04）
* Model代理 (2018.01.28)
* ESlint (2018.02.01

### v1.0.0

* 音乐api (2017.9.26)
* Github oauth 代理 (2017.9.28)
* 文章分类api (2017.10.26)
* Redis缓存部分数据 (2017.10.27 v1.1)
* 评论api (2017.10.28)
* 评论定位 [geoip](https://github.com/bluesmoon/node-geoip) (2017.10.29)
* 垃圾评论过滤 [akismet](https://github.com/chrisfosterelli/akismet-api) (2017.10.29)
* 用户禁言 (2017.10.29)
* 评论发送邮件 [nodemailer](https://github.com/nodemailer/nodemailer) (2017.10.29)
* GC优化 (2017.10.30，linux下需要预先安装g++, **已废弃**)
* 个人动态api (2017.10.30)


