/*
 * Summary: Logger Module
 * Module: /src/shared/logger/logger.module.ts
 * -----
 * File Created: 2019-08-26 19:33:29, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 7:48:18 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Module } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { VarModule } from '../../config/var/var.module'

@Module({
  imports: [VarModule],
  providers: [LoggerService]
})
export class LoggerModule {}
