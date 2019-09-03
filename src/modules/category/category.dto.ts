import { ObjectID } from 'typeorm'
import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { Extend } from '../../common/entity/extend.entity'
import { CreateCategoryInput } from '../../graphql'

export class CreateCategoryInputDto extends CreateCategoryInput {
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString({ message: '分类名称必须为字符串' })
  name: string

  @IsString({ message: '分类描述必须为字符串' })
  description?: string

  @Type(type => Extend)
  @IsArray({ message: '分类扩展必须为数组' })
  @ValidateNested({ each: true })
  extends: Extend[]
}

export class UpdateCategoryInputDto extends CreateCategoryInputDto {
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  id: ObjectID
}
