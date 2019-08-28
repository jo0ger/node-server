/*
 * Summary: Graphql Service
 * File: /src/config/graphql/graphql.service.ts
 * File Created: 2019-08-28 22:48:06, Wed
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-28 22:48:55, Wed
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import * as path from 'path'
import { Injectable } from '@nestjs/common'
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql'
import { VarService } from '../var/var.service'
import { LoggerService } from '../../shared/logger/logger.service'

@Injectable()
export class GraphqlService implements GqlOptionsFactory {
  constructor (
    private readonly varService: VarService,
    private readonly logger: LoggerService
  ) {}

  async createGqlOptions (): Promise<GqlModuleOptions> {
    return {
      debug: !this.varService.isProd(),
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: path.join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class'
      },
      formatError: err => err,
      formatResponse: res => res,
      subscriptions: {
        onConnect: (connectionParams, websocket, ctx) => {
          this.log('🔗 Connected to websocket')
        },
        onDisconnect: (websocket, ctx) => {
          this.log('🔗 Disconnected to websocket')
        }
      },
      installSubscriptionHandlers: true,
      introspection: true,
      playground: {
        settings: {
          'editor.cursorShape': 'line',
          'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
          'editor.fontSize': 14,
          'editor.reuseHeaders': true,
          'editor.theme': 'dark',
          'general.betaUpdates': false,
          'request.credentials': 'omit',
          'tracing.hideTracingResponse': true,
          'queryPlan.hideQueryPlanResponse': false
        }
      }
    }
  }

  private log (msg: any) {
    return this.logger.log(msg, 'Graphql')
  }
}
