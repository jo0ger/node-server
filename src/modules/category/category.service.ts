/*
 * Summary: Category Service
 * Module: /src/modules/category/category.service.ts
 * -----
 * File Created: 2019-08-29 10:07:38, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Thursday, 29th August 2019 1:29:34 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Injectable } from '@nestjs/common'
import { MongoRepository, ObjectID } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './category.entity'

@Injectable()
export class CategoryService {
  constructor (
    @InjectRepository(Category)
    private readonly categoryRepo: MongoRepository<Category>
  ) {}

  async findAll () {
    return await this.categoryRepo.find({
      cache: true
    })
  }

  async findById (id: ObjectID) {
    return await this.categoryRepo.findOne(id)
  }

  async create () {}

  async update () {}

  async deleteAll () {}

  async deleteById () {}
}
