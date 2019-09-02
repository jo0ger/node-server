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
import { MongoRepository, ObjectID, Not, In, Equal } from 'typeorm'
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

  async checkName (where = {}) {
    const exist = await this.categoryRepo.findOne({ where })
    if (exist) {
      throw new BadRequestException('分类名称重复')
    }
  }

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
    await this.checkName({ name })
    const category = new Category(
      name,
      input.description,
      input.extends as Extend[]
    )
    return await this.categoryRepo.save(category)
  }

  async update (input: UpdateCategoryInput) {
    const { id, name } = input
    await this.checkName({
      id: {
        $nin: [id]
      },
      name
    })
    const res = await this.categoryRepo.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...input,
          updatedAt: Date.now()
        }
      },
      { returnOriginal: false })
    return res.value
  }

  async deleteMany (ids: ObjectID[] | string) {
    let idS = []
    if (typeof ids === 'string') {
      idS = ids.split(',')
    }
    return await this.categoryRepo.deleteMany({
      where: {
        id: In(idS)
      }
    })
  }

  async deleteById (id: ObjectID) {
    const res = await this.categoryRepo.findOneAndDelete({ _id: id })
    return res.value
  }
}
