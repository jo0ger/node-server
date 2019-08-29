/*
 * Summary: Category Resolver for Graphql query
 * Module: /src/modules/category/category.resolver.ts
 * -----
 * File Created: 2019-08-29 10:07:38, Thu
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Thursday, 29th August 2019 2:21:36 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { ObjectID } from 'typeorm';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryInput } from '../../graphql'

@Resolver('Category')
export class CategoryResolver {
  constructor (
    private readonly categoryService: CategoryService
  ) {}

  @Query(() => [Category])
  async getCategories () {
    return this.categoryService.findAll()
  }

  @Query(() => Category)
  async getCategoryById (@Args('id') id: ObjectID) {
    return this.categoryService.findById(id)
  }

  @Mutation(() => Category, { name: 'createCategory' })
  async createCategory (
    @Args('input') input: Category
  ) {
    const category = await this.categoryService.create(input)
    return category
  }
}
