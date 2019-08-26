/*
 * Summary: Variables Module
 * Module: /src/config/var/var.module.ts
 * -----
 * File Created: 2019-08-26 10:35:22, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 10:35:36 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import { Module } from '@nestjs/common'
import { VarService } from './var.service'

@Module({
  providers: [
    {
      provide: VarService,
      useValue: new VarService(`src/${process.env.NODE_ENV}.env`)
    }
  ],
  exports: [VarService]
})
export class VarModule {}
