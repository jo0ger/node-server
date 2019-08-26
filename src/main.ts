/*
 * Summary: Application Launcher
 * Module: /src/main.ts
 * -----
 * File Created: 2019-08-23 18:46:37, Fri
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 10:11:44 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import * as helmet from 'helmet'
import * as compression from 'compression'
import * as rateLimit from 'express-rate-limit'
import * as bodyParser from 'body-parser'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { VarService } from './config/var/var.service'
import { LoggerService } from './shared/logger/logger.service'

declare const module: NodeModule & { hot: any }

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false
  })
  // -> Reflect
  const varService = app.get(VarService)
  const loggerService = app.get(LoggerService)

  // -> App 配置
  const { APP_NAME, APP_PORT } = varService.getVars()
  app.useLogger(loggerService)
  loggerService.log(`${APP_NAME} is starting....`)

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

bootstrap().then(([{ APP_NAME, APP_PORT, NODE_ENV }, logger]) => {
  // tslint:disable-next-line: no-console
  logger.log(`${APP_NAME} has been started! port at ${APP_PORT}, env is ${NODE_ENV}`)
})
