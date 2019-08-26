/*
 * Summary: TypeOrm Module
 * Module: /src/config/typeorm/typeorm.module.ts
 * -----
 * File Created: 2019-08-23 19:02:24, Fri
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 10:05:10 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import { Module } from '@nestjs/common'
import { TypeormService } from './typeorm.service'

@Module({
  providers: [TypeormService]
})
export class TypeormModule {}
