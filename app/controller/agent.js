const { Controller } = require('egg')

module.exports = class AgentController extends Controller {
    async voice () {
        this.ctx.success(await this.service.agent.voice())
    }

    async ip () {
        const { ctx } = this
        ctx.validate({
            ip: { type: 'string', required: true }
        }, ctx.query)
        this.ctx.success(await this.service.agent.lookupIp(ctx.query.ip), 'IP查询成功')
    }
}
