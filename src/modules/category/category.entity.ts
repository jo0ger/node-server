/*
 * Summary: Category Entity
 * File: /src/modules/category/category.entity.ts
 * File Created: 2019-08-29 00:01:49, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-29 00:02:05, Thu
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Entity, Column, ObjectIdColumn, ObjectID } from "typeorm"
import { IsString, IsNotEmpty, IsArray } from "class-validator"
import { BaseEntity } from "../../common/entity/base.entity"
import { Extend } from "../../common/entity/extend.entity"

@Entity('categories')
export class Category extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  @IsString({ message: '分类名称必须为字符串' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  name: string

  @Column({ default: '' })
  @IsString({ message: '分类描述必须为字符串' })
  description: string

  @Column(type => Extend)
  @IsArray()
  extends: Extend[]
}
