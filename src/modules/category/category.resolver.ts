import { Resolver, Query } from '@nestjs/graphql';
import { Category } from './category.entity';
import { CategoryService } from './category.service';

@Resolver('Category')
export class CategoryResolver {
  constructor (
    private readonly categoryService: CategoryService
  ) {}

  @Query(() => Category)
  async getCategories () {
    return this.categoryService.findAll()
  }
}
