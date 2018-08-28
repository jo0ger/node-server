/**
 * @desc Comment Services
 */

const ProxyService = require('./proxy')

module.exports = class CommentService extends ProxyService {
    get model () {
        return this.app.model.Comment
    }

    async getItemById (id) {
        let data = null
        const populate = [
            {
                path: 'author',
                select: 'github name avatar'
            }, {
                path: 'parent',
                select: 'author meta sticky ups'
            }, {
                path: 'forward',
                select: 'author meta sticky ups'
            }
        ]
        if (!this.ctx._isAuthed) {
            data = await this.getItem(
                { _id: id, state: 1, spam: false },
                '-content -state -updatedAt -type -spam',
                null,
                populate
            )
        } else {
            data = await this.getItem({ _id: id }, null, null, populate)
        }
        return data
    }

    async sendCommentEmailToAdminAndUser (comment) {
        const { type, article } = comment
        const commentType = this.config.modelValidate.comment.type.optional
        const permalink = this.getPermalink(comment)
        const adminType = this.getCommentType(comment.type)
        let adminTitle = '未知的评论'
        if (type === commentType.COMMENT) {
            // 文章评论
            const at = await this.service.article.getItemById(article._id || article)
            if (at && at._id) {
                adminTitle = `博客文章《${at.title}》有了新的评论`
            }
        } else if (type === commentType.MESSAGE) {
            // 站内留言
            adminTitle = '个人站点有新的留言'
        }

        // 发送给管理员邮箱config.email
        this.service.mail.sendToAdmin({
            subject: adminTitle,
            text: `来自 ${comment.author.name} 的${adminType}：${comment.content}`,
            html: `<p>来自 <a href="${comment.author.github.blog || '#'}" target="_blank">${comment.author.name}</a> 的${adminType} => <a href="${permalink}" target="_blank">点击查看</a>：${comment.renderedContent}</p>`
        })

        // 发送给被评论者
        if (comment.forward && comment.forward._id !== comment.author._id) {
            const forwardAuthor = await this.service.user.findById(comment.forward.author).exec().catch(() => null)
            if (forwardAuthor) {
                this.service.mail.send({
                    to: forwardAuthor.github.email,
                    subject: `你在 ${this.config.author} 的博客的评论有了新的回复`,
                    text: `来自 ${comment.author.name} 的回复：${comment.content}`,
                    html: `<p>来自 <a href="${comment.author.github.blog || '#'}" target="_blank">${comment.author.name}</a> 的回复 => <a href="${permalink}" target="_blank">点击查看</a>：${comment.renderedContent}</p>`
                })
            }
        }
    }

    /**
     * @desc 获取评论所属页面链接
     * @param {Comment} comment 评论
     * @return {String} 页面链接
     */
    getPermalink (comment = {}) {
        const { type, article } = comment
        const { COMMENT, MESSAGE } = this.config.modelValidate.comment.type.optional
        const url = this.config.author.url
        switch (type) {
        case COMMENT:
            return `${url}/articles/${article._id || article}`
        case MESSAGE:
            return `${url}/guestbook`
        default:
            return ''
        }
    }

    /**
     * @desc 获取评论类型文案
     * @param {Number | String} type 评论类型
     * @return {String} 文案
     */
    getCommentType (type) {
        return ['文章评论', '站点留言'][type] || '评论'
    }
}
