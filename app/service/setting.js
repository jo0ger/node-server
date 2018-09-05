/**
 * @desc Setting Services
 */

const ProxyService = require('./proxy')

module.exports = class SettingService extends ProxyService {
    get model () {
        return this.app.model.Setting
    }

    /**
     * @desc 初始化配置数据，用于server初始化时
     * @return {Setting} 配置数据
     */
    async seed () {
        const exist = await this.getItem()
        if (exist) {
            return exist
        }
        // TIP: 这里不能用create，create如果不传model，是不会创建的
        const data = await this.newAndSave()
        if (data) {
            this.logger.info('Setting初始化成功')
        } else {
            this.logger.info('Setting初始化失败')
        }
        return data
    }

    /**
     * @desc 抓取并生成友链
     * @param {Array} links 友链
     * @return {Array} 抓取后的友链
     */
    async generateLinks (links = []) {
        if (!links || !links.length) return []
        links = await Promise.all(
            links.map(async link => {
                if (link) {
                    const userInfo = await this.service.github.getUserInfo(link.github)
                    if (userInfo) {
                        link.avatar = this.app.proxyUrl(userInfo.avatar_url)
                        link.slogan = userInfo.bio
                        link.site = link.site || userInfo.blog || userInfo.url
                    }
                    return link
                }
                return null
            })
        )
        this.logger.info('友链抓取成功')
        return links.filter(item => !!item)
    }

    /**
     * @desc 更新友链
     * @return {Setting} 更新友链后的配置数据
     */
    async updateLinks () {
        let setting = await this.getItem()
        if (!setting) return null
        const update = await this.generateLinks(setting.site.links)
        if (!update.length) return
        setting = await this.updateItemById(setting._id, {
            $set: {
                'site.links': update
            }
        })
        this.logger.info('友链更新成功')
        // 更新后挂载到app上
        this.mountToApp(setting)
        return setting
    }

    /**
     * @desc 更新personal的github信息
     * @return {Setting} 更新后的setting
     */
    async updateGithubInfo () {
        let setting = await this.getItem()
        if (!setting) return null
        const github = setting.personal.github
        if (!github.login) return
        const user = await this.service.github.getUserInfo(github.login)
        if (!user) return
        setting = await this.updateItemById(setting._id, {
            $set: {
                'personal.github': user
            }
        })
        // 个人github信息更新成功
        this.logger.info('个人github信息更新成功')
        this.mountToApp(setting)
        return setting
    }

    /**
     * @desc 把配置挂载到app上
     * @param {Setting} setting 配置
     */
    async mountToApp (setting) {
        if (!setting) {
            setting = await this.getItem()
        }
        this.app.setting = setting || null
        this.logger.info('配置挂载成功')
    }
}
