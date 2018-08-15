import { Context } from 'egg'
const DataLoader = require('dataloader')

export default class CategoryConnector {
    ctx!: Context
    loader!: any

    constructor (ctx) {
        this.ctx = ctx
        this.loader = new DataLoader(this.find.bind(this))
    }

    find (ids) {
        return this.ctx.service.category.findByIds(ids)
    }

    findById (id) {
        return this.loader.load(id)
    }
}
