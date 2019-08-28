/*
 * Summary: Graphql Module
 * File: /src/config/graphql/graphql.module.ts
 * File Created: 2019-08-28 22:47:54, Wed
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-28 22:48:28, Wed
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Module } from '@nestjs/common'
import { VarModule } from '../var/var.module'
import { GraphqlService } from './graphql.service'
import { LoggerModule } from 'src/shared/logger/logger.module'

@Module({
  imports: [
    VarModule,
    LoggerModule
  ],
  providers: [GraphqlService]
})
export class GraphqlModule {}
