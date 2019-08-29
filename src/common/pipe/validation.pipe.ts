/*
 * Summary: 通用验证器
 * File: /src/common/pipe/validation.pipe.ts
 * File Created: 2019-08-28 23:50:40, Wed
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: 2019-08-28 23:51:08, Wed
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { PipeTransform, ArgumentMetadata, Injectable, BadRequestException } from '@nestjs/common'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }
    const object = plainToClass(metatype, value)
    const errors = await validate(object)
    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors))
    }
    return value
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object]
    return !types.find(type => metatype === type)
  }

  private formatErrors (errors: ValidationError[] = [], stringify = true): string | string[] {
    // 错误信息去重
    const res = Array.from(new Set(
      errors
        .reduce((prev, err) => {
          prev.push()
          return prev.concat(
            ...Object.values(err.constraints || []),
            // TIP: 因为有嵌套校验，所以此处还需要校验子对象
            ...this.formatErrors(err.children, false)
          )
        }, [])
        .filter(err => err)
    ))
    return stringify ? res.join(';') : res
  }
}