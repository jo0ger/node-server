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

import { Injectable, BadRequestException } from '@nestjs/common'
import { MongoRepository, ObjectID, Not, In } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { Category } from './category.entity'
import { CreateCategoryInput, UpdateCategoryInput } from '../../graphql'
import { Extend } from '../../common/entity/extend.entity'

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

  async create (input: CreateCategoryInput) {
    const { name } = input
    const exist = await this.categoryRepo.findOne({ name })
    if (exist) {
      throw new BadRequestException('分类名称重复')
    }
    const category = new Category(
      name,
      input.description,
      input.extends as Extend[]
    )
    return await this.categoryRepo.save(category)
  }

  async update (input: UpdateCategoryInput) {
    const { id, name } = input
    const exist = await this.categoryRepo.findOne({
      where: {
        name: Not(name)
      }
    })
    if (exist) {
      throw new BadRequestException('分类名称重复')
    }
    return await this.categoryRepo.updateOne({ id }, input)
  }

  async deleteMany (ids: ObjectID[]) {
    return await this.categoryRepo.deleteMany({
      where: {
        id: In(ids)
      }
    })
  }

  async deleteById (id: ObjectID) {
    return await this.categoryRepo.deleteOne({ id })
  }
}
