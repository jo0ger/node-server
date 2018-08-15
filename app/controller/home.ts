import { Controller } from 'egg';

export default class HomeController extends Controller {
    public async index() {
        const { ctx } = this;
        // ctx.body = await ctx.service.test.sayHi('egg');
        const id = 1
        const query = JSON.stringify({
        query: `
            {
                category(id: ${id}) {
                    id
                    name
                    description
                }
            }
        `
        })
        const data = await ctx.service.graphql.query(query)
        ctx.body = data
    }
}
