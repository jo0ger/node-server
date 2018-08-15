/**
 * @desc category controller
 */

import { Controller } from 'egg';

export default class CategoryController extends Controller {
    public async index() {
        const { ctx } = this;
        ctx.body = await ctx.service.test.sayHi('egg');
    }
}
