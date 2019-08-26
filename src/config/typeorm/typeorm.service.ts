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
import { getMetadataArgsStorage } from 'typeorm'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { VarService } from '../var/var.service'

@Injectable()
export class TypeormService implements TypeOrmOptionsFactory {
  constructor (
    private readonly varService: VarService
  ) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const isProd = this.varService.isProd()
    return {
      type: 'mongodb',
      url: this.varService.get('MONGO_URL'),
      entities: getMetadataArgsStorage().tables.map(t => t.target),
      synchronize: true,
      useNewUrlParser: true,
      // TIP: 如果用了 webpack hmr 进行开发，那么这个选项必传 true，不然会造成重复连接报错
      keepConnectionAlive: !isProd,
      logging: !isProd
    }
  }
}
