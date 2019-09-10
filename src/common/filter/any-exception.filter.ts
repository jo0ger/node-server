/*
 * Summary: Any exception filter
 * Module: /src/common/filter/any-exception.filter.ts
 * -----
 * File Created: 2019-09-03 12:41:31, Tue
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Tuesday, 3rd September 2019 12:42:11 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { ServerResponse } from 'http';

@Catch()
export class AnyExceptionFilter implements GqlExceptionFilter {
  catch (exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host)
    const { req, res } = gqlHost.getContext()
    return exception
  }
}
