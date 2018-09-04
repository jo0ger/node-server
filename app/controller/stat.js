const { Controller } = require('egg')

module.exports = class StatController extends Controller {
    async count () {
        const data = await this.service.stat.count()
        this.ctx.success(data)
    }
}
