import { Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';

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
}
