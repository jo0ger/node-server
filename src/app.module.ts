import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ArticleModule } from './modules/article/article.module'
import { TypeormService } from './config/typeorm/typeorm.service'
import { TypeormModule } from './config/typeorm/typeorm.module'
import { VarModule } from './config/var/var.module'
import { LoggerModule } from './shared/logger/logger.module'
import { GraphQLModule } from '@nestjs/graphql'
import { GraphqlService } from './config/graphql/graphql.service'
import { CategoryModule } from './modules/category/category.module';

@Module({
  imports: [
    VarModule,
    ArticleModule,
    LoggerModule,
    TypeormModule,
    TypeOrmModule.forRootAsync({
      // TIP: Here need to import the VarModule for using VarService
      imports: [VarModule],
      useClass: TypeormService
    }),
    GraphQLModule.forRootAsync({
      imports: [VarModule, LoggerModule],
      useClass: GraphqlService
    }),
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService, TypeormService]
})
export class AppModule {}
