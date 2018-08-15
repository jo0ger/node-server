import { Service } from 'egg'
import { ModelProxy } from './proxy'

export default class Category extends Service {
    proxy!: ModelProxy
    
    constructor (ctx) {
        super(ctx)
        this.proxy = this.service.proxy.getModelProxy(this.app.model.Category)
    }

    public async findByIds (ids) {
        return await this.proxy.find({
            id: {
                $in: ids
            }
        })
    }

    public async findById (id) {
        return await this.proxy.findOne({ id })
    }
}