/*
 * Summary: 扩展模型
 * File: /src/common/entity/extend.entity.ts
 * File Created: 2019-08-29 00:20:56, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-29 00:24:49, Thu
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Column, ObjectID, ObjectIdColumn } from "typeorm"
import { IsString, IsNotEmpty } from "class-validator"

export class Extend {
  @ObjectIdColumn()
  id: ObjectID
  
  @Column()
  @IsNotEmpty({ message: '扩展名称不能为空' })
  @IsString({ message: '扩展名称必须为字符串' })
  key: string

  @Column()
  @IsNotEmpty()
  @IsString()
  value: string
}