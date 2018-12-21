/**
 * @desc Comment Services
 */

const path = require('path')
const fs = require('fs')
const moment = require('moment')
const Email = require('email-templates')
const ProxyService = require('./proxy')

const email = new Email()

module.exports = class CommentService extends ProxyService {
    get model () {
        return this.app.model.Comment
    }

    async getItemById (id) {
        let data = null
        const populate = [
            {
                path: 'author',
                select: 'github name avatar email site'
            }, {
                path: 'parent',
                select: 'author meta sticky ups'
            }, {
                path: 'forward',
                select: 'author meta sticky ups renderedContent'
            }, {
                path: 'article',
                select: 'title, description thumb createdAt'
            }
        ]
        if (!this.ctx.session._isAuthed) {
            data = await this.getItem(
                { _id: id, state: 1, spam: false },
                '-content -state -updatedAt -spam',
                null,
                populate
            )
        } else {
            data = await this.getItem({ _id: id }, null, null, populate)
        }
        return data
    }

    async sendCommentEmailToAdminAndUser (comment, canReply = true) {
        if (comment.toObject) {
            comment = comment.toObject()
        }
        const { type, article } = comment
        const commentType = this.config.modelEnum.comment.type.optional
        const permalink = this.getPermalink(comment)
        let adminTitle = '未知的评论'
        let typeTitle = ''
        let at = null
        if (type === commentType.COMMENT) {
            // 文章评论
            typeTitle = '评论'
            at = await this.service.article.getItemById(article._id || article)
            if (at && at._id) {
                adminTitle = `博客文章《${at.title}》有了新的评论`
            }
        } else if (type === commentType.MESSAGE) {
            // 站内留言
            typeTitle = '留言'
            adminTitle = '博客有新的留言'
        }

        const authorId = comment.author._id.toString()
        const adminId = this.app._admin._id.toString()
        const forwardAuthorId = comment.forward && comment.forward.author.toString()
        // 非管理员评论，发送给管理员邮箱
        if (authorId !== adminId) {
            const html = await renderCommentEmailHtml(adminTitle, permalink, comment, at, canReply)
            this.service.mail.sendToAdmin(typeTitle, {
                subject: adminTitle,
                html
            })
        }
        // 非回复管理员，非回复自身，才发送给被评论者
        if (forwardAuthorId && forwardAuthorId !== authorId && forwardAuthorId !== adminId) {
            const forwardAuthor = await this.service.user.getItemById(forwardAuthorId)
            if (forwardAuthor && forwardAuthor.email) {
                const subject = `你在 Jooger.me 的博客的${typeTitle}有了新的回复`
                const html = await renderCommentEmailHtml(subject, permalink, comment, at, canReply)
                this.service.mail.send(typeTitle, {
                    to: forwardAuthor.email,
                    subject,
                    html
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
        const { COMMENT, MESSAGE } = this.config.modelEnum.comment.type.optional
        const url = this.config.author.url
        switch (type) {
        case COMMENT:
            return `${url}/article/${article._id || article}`
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

async function renderCommentEmailHtml (title, link, comment, showReplyBtn = true) {
    const data = Object.assign({}, comment, {
        title,
        link,
        createdAt: moment(comment.createdAt).format('YYYY-MM-DD hh:mm'),
        showReplyBtn
    })
    const html = await email.render('comment', data)
    const style = `<style>${getCommentStyle()}</style>`
    return html + style
}

function getCommentStyle () {
    const markdownStyle = path.resolve('emails/markdown.css')
    const markdownCss = fs.readFileSync(markdownStyle, {
        encoding: 'utf8'
    })
    return markdownCss
}
