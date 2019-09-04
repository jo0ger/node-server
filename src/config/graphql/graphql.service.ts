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
import { ObjectId } from 'mongodb'
import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'
import { GqlOptionsFactory, GqlModuleOptions } from '@nestjs/graphql'
import { VarService } from '../var/var.service'
import { LoggerService } from '../../shared/logger/logger.service'

function parseObjectId (id) {
  if (ObjectId.isValid(id)) {
    return ObjectId(id)
  }
  throw new Error('ObjectId must be a single String of 24 hex characters')
}

@Injectable()
export class GraphqlService implements GqlOptionsFactory {
  constructor (
    private readonly varService: VarService,
    private readonly logger: LoggerService
  ) {}

  async createGqlOptions (): Promise<GqlModuleOptions> {
    return {
      debug: !this.varService.isProd(),
      path: '/api/graphql',
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: path.join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class'
      },
      formatError: err => err,
      formatResponse: res => res,
      resolvers: {
        ObjectId: new GraphQLScalarType({
          name: 'ObjectId',
          description: 'The `ObjectId` scalar type represents a mongodb unique ID',
          serialize: String,
          parseValue: parseObjectId,
          parseLiteral (ast: any) {
            return parseObjectId(ast.value)
          }
        }),
        Date: new GraphQLScalarType({
          name: 'Date',
          description: 'Date scalar type',
          parseValue (value) {
            return new Date(value)
          },
          serialize (value) {
            return value.getTime()
          },
          parseLiteral (ast) {
            if (ast.kind === Kind.INT) {
              return new Date(ast.value)
            }
            return null
          },
        })
      },
      directiveResolvers: {},
      context: async ({ req, res, connection }) => {
        if (connection) {
          return {
            req: connection.context
          }
        }

        return {
          req,
          res,
          qqq: 111
        }
      },
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
