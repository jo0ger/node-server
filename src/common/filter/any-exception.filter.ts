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
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ServerResponse } from 'http';

@Catch(HttpException)
export class AnyExceptionFilter implements GqlExceptionFilter {
  catch (exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host)
    const ctx = gqlHost.getContext()
    const args = gqlHost.getArgs()
    const info = gqlHost.getInfo()
    const root = gqlHost.getRoot()
    const ctx2 = new ExecutionContextHost([ctx.req])
    console.log(ctx2);
    console.log(ctx.req.body);
    console.log(ctx.res.req);
    return exception
    // const response = ctx.getResponse()
    // const request = ctx.getRequest()
    // const status = exception.getStatus();
    // console.log(request, response.status);
    // response
    //   .status(status)
    //   .json({
    //     status,
    //     timestamp: new Date().toISOString(),
    //     path: request.url,
    //   })
  }
}
