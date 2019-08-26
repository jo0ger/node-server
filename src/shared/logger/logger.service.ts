/*
 * Summary: Logger Service
 * Module: /src/shared/logger/logger.service.ts
 * -----
 * File Created: 2019-08-26 19:33:37, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 7:37:16 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import * as path from 'path'
import * as Nest from '@nestjs/common'
import { Injectable } from '@nestjs/common'
import { Logger, getLogger, configure } from 'log4js'
import { VarService } from '../../config/var/var.service'
import * as clc from 'cli-color'

@Injectable()
export class LoggerService implements Nest.LoggerService {
  private readonly logger: Logger
  private readonly ctxColor = clc.xterm(215)
  private readonly msgColor = clc.xterm(39)

  constructor (
    private readonly varService: VarService
  ) {
    const { APP_NAME, LOG_PATH, LOG_LEVEL } = varService.getVars()
    configure({
      appenders: {
        out: { type: 'console' },
        app: {
          type: 'dateFile',
          filename: path.join(LOG_PATH, APP_NAME),
          pattern: '-yyyy-MM-dd.log',
          alwaysIncludePattern: true,
          appender: {
            type: 'console'
          }
        }
      },
      categories: {
        default: {
          appenders: ['out', 'app'],
          level: LOG_LEVEL
        }
      }
    })
    this.logger = getLogger(`${APP_NAME}`)
  }

  getLogger (category?: string) {
    return getLogger(category)
  }

  log (message: any, context?: string) {
    this.logger.info(this.formatContext(context), this.formatMessage(message))
  }

  error (message: any, trace?: string, context?: string) {
    this.logger.error(this.formatContext(context), this.formatMessage(message))
  }

  warn (message: any, context?: string) {
    this.logger.warn(this.formatContext(context), this.formatMessage(message))
  }

  private formatContext (ctx) {
    return this.ctxColor(`[${ctx || 'APP'}]`)
  }

  private formatMessage (msg) {
    // TODO format message
    return this.msgColor(msg)
  }
}
