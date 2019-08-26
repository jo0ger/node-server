/*
 * Summary: TypeOrm service for connecting MongoDB
 * Module: /src/config/typeorm/typeorm.service.ts
 * -----
 * File Created: 2019-08-23 19:02:15', Fri
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 9:51:45 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import { Injectable } from '@nestjs/common'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { getMetadataArgsStorage } from 'typeorm'

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'mongodb',
      url: 'mongodb://node-server:node-server@127.0.0.1:27017/node-server',
      entities: getMetadataArgsStorage().tables.map(t => t.target),
      synchronize: true,
      useNewUrlParser: true,
      logging: true
    }
  }
}
