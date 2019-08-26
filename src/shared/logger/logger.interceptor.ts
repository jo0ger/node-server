/*
 * Summary: Http request/response logger
 * Module: /src/shared/logger/logger.interceptor.ts
 * -----
 * File Created: 2019-08-26 20:42:37, Mon
 * Author: Jooger (iamjooger@gmail.com)
 * -----
 * Last Modified: Monday, 26th August 2019 8:44:53 pm
 * Modified By: Jooger (iamjooger@gmail.com>)
 */

import { Observable } from 'rxjs'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { LoggerService } from './logger.service'
import { stringify } from 'circular-json-es6'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor (
    private readonly loggerService: LoggerService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const start = Date.now();
    return next
      .handle()
      .pipe(
        tap(res => {
          this.loggerService.log(this.requestFormat(req), 'Request')
          this.loggerService.log(this.responseFormat(res), `Response ${Date.now() - start}ms`)
        })
      )
  }

  private requestFormat (req: any): string {
    return stringify({
      url: req.url,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body,
      httpVersion: req.httpVersion,
      headers: req.headers,
      route: req.route
    })
  }

  private responseFormat (res: any): string {
    return stringify(res)
  }
}
