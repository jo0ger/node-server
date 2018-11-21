/**
 * @desc Setting Controller
 */

const { Controller } = require('egg')

module.exports = class SettingController extends Controller {
    get rules () {
        return {
            index: {
                filter: { type: 'string', required: false }
            },
            update: {
                site: { type: 'object', required: false },
                personal: { type: 'object', required: false },
                keys: { type: 'object', required: false },
                limit: { type: 'object', required: false }
            }
        }
    }

    async index () {
        const { ctx } = this
        ctx.validate(this.rules.index, ctx.query)
        let select = null
        if (ctx.query.filter) {
            select = ctx.query.filter
        }
        let populate = null
        if (!ctx.session._isAuthed) {
            select = '-keys'
            populate = [
                {
                    path: 'personal.user',
                    select: 'name email site avatar'
                }
            ]
        } else {
            populate = [
                {
                    path: 'personal.user',
                    select: '-password'
                }
            ]
        }
        const data = await this.service.setting.getItem(
            {},
            select,
            null,
            populate
        )
        if (data) {
            if (!data.personal.github) {
                data.personal.github = {}
            }
            ctx.success(data, '配置获取成功')
        } else {
            ctx.fail('配置获取失败')
        }
    }

    async update () {
        const { ctx } = this
        const body = ctx.validateBody(this.rules.update)
        const exist = await this.service.setting.getItem()
        if (!exist) {
            return ctx.fail('配置未找到')
        }
        const update = this.app.merge({}, exist, body)
        // 先不更新友链，在下方更新
        update.site.links = exist.site.links
        let data = await this.service.setting.updateItemById(
            exist._id,
            update,
            null,
            [
                {
                    path: 'personal.user',
                    select: '-password'
                }
            ]
        )
        if (!data) {
            return ctx.fail('配置更新失败')
        }

        if (body.site && body.site.links) {
            // 抓取友链
            data = await this.service.setting.updateLinks(body.site.links)
        }

        if (body.personal && body.personal.github) {
            // 更新github信息
            data = await this.service.setting.updateGithubInfo()
        }

        this.service.setting.mountToApp(data)

        if (body.site && body.site.musicId && body.site.musicId !== exist.site.musicId) {
            // 更新music缓存
            this.service.agent.fetchRemoteMusicList(true)
        }

        ctx.success(data, '配置更新成功')
    }
}
