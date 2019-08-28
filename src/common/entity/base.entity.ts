/*
 * Summary: Base Business Entity
 * File: /src/common/entity/base.entity.ts
 * File Created: 2019-08-29 00:27:32, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-29 00:32:59, Thu
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { CreateDateColumn } from "typeorm"

export class BaseEntity {
  @CreateDateColumn({ type: 'date', default: Date.now })
  createdAt: Date

  @CreateDateColumn({ type: 'date', default: Date.now })
  updatedAt: Date
}