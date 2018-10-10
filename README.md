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

[HERE](CHANGELOG.md)
