/*
 * Summary: App Module
 * Module: /src/app.module.ts
 * -----
 * File Created: 2019-08-23 18:46:37, Fri
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 10:11:02 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArticleModule } from './modules/article/article.module'
import { TypeormService } from './config/typeorm/typeorm.service'
import { TypeormModule } from './config/typeorm/typeorm.module'
import { VarModule } from './config/var/var.module'
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [
    VarModule,
    ArticleModule,
    TypeormModule,
    TypeOrmModule.forRootAsync({
      // TIP: Here need to import the VarModule for using VarService
      imports: [VarModule],
      useClass: TypeormService
    }),
    LoggerModule
  ],
  controllers: [AppController],
  providers: [AppService, TypeormService]
})
export class AppModule {}
