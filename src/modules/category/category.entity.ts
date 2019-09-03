/*
 * Summary: Category Entity
 * File: /src/modules/category/category.entity.ts
 * File Created: 2019-08-29 00:01:49, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-29 00:02:05, Thu
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm'
import { BaseEntity } from '../../common/entity/base.entity'
import { Extend } from '../../common/entity/extend.entity'

@Entity('categories')
export class Category extends BaseEntity {
  @ObjectIdColumn()
  id: ObjectID

  @Column()
  name: string

  @Column({ default: '' })
  description?: string

  @Column(type => Extend)
  extends: Extend[]

  constructor (
    name: string,
    description: string = '',
    exts: Extend[] = []
  ) {
    super()
    this.name = name
    this.description = description
    this.extends = exts
  }
}
