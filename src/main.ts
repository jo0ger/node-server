/*
 * Summary: Application Launcher
 * File: /src/main.ts
 * File Created: 2019-08-26 21:43:40, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-26 22:47:44, Mon
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import * as helmet from 'helmet'
import * as compression from 'compression'
import * as rateLimit from 'express-rate-limit'
import * as bodyParser from 'body-parser'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { VarService } from './config/var/var.service'
import { LoggerService } from './shared/logger/logger.service'
import { LoggerInterceptor } from './shared/logger/logger.interceptor'
import { ValidationPipe } from './common/pipe/validation.pipe'
import { AnyExceptionFilter } from './common/filter/any-exception.filter'

declare const module: NodeModule & { hot: any }

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false
  })
  // -> Reflect
  const varService = app.get(VarService)
  const loggerService = app.get(LoggerService)

  // -> App 配置
  const { APP_NAME, APP_PORT, CORS_ALLOWED_ORIGINS, CORS_ALLOWED_METHODS, CORS_ALLOWED_HEADERS, CORS_MAX_AGE } = varService.getVars()
  loggerService.log(`${APP_NAME} is starting....`)
  app.useLogger(loggerService)
  app.useGlobalInterceptors(app.get(LoggerInterceptor))
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new AnyExceptionFilter())

  // -> CORS
  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    maxAge: CORS_MAX_AGE,
    optionsSuccessStatus: 204
  })

  // -> 添加一些保证 App 安全的 Http headers
  app.use(helmet())

  // -> Request Body 解析
  app.use(bodyParser.json())
  app.use(bodyParser.text())
  app.use(bodyParser.raw())
  app.use(bodyParser.urlencoded({ extended: false }))

  // -> Gzip
  app.use(compression())

  // -> 限速
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 请求缓存 15 分钟
    max: 100 // 在缓存期间最多允许 100 个连接
  }))

  await app.listen(APP_PORT || 3000)

  // -> Webpack HRM
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }

  return [varService.getVars(), loggerService]
}

bootstrap().then(([{ APP_NAME, APP_PORT, APP_ENV }, logger]) => {
  logger.log(`${APP_NAME} has been started! port: ${APP_PORT}, env: ${APP_ENV}`)
})
