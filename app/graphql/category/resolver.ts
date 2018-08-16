import { Context } from 'egg'

export default {
    Query: {
        category (_root, params, ctx: Context) {
            return ctx.connector.category.findById(params.id)
        }
    }
}