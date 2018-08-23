/**
 * @desc Auth Controller
 */

const {
    Controller
} = require('egg')

module.exports = class AuthController extends Controller {
    async login () {
        await this.service.auth.login()
    }

    async logout () {
        await this.service.auth.logout()
    }

    async info () {
        await this.service.auth.info()
    }

    async update () {
        const { ctx } = this
        const data = await this.service.auth.update()
        data
            ? ctx.success(data, '信息更新成功')
            : ctx.fail('信息更新失败')
    }
}
