/*
 * Summary: Variables Service
 * Module: /src/config/var/var.service.ts
 * -----
 * File Created: 2019-08-26 10:35:28, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 10:36:05 am
 * Modified By: Jooger (iamjooger@gmail.com>)
 * HISTORY:
 * Date      	By	Comments
 * ----------	---	---------------------------------------------------------
 */

import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { Injectable } from '@nestjs/common'

@Injectable()
export class VarService {
  private readonly envVars: { [key: string]: string }

  constructor (filePath: string) {
    this.envVars = dotenv.parse(fs.readFileSync(filePath))
  }

  public get (key: string): string {
    return this.envVars[key]
  }

  public getVars () {
    return Object.assign(this.envVars)
  }

  public isProd () {
    return this.get('NODE_ENV') === 'production'
  }
}
