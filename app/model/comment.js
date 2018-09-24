module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const commentValidateConfig = config.modelEnum.comment

    const CommentSchema = new Schema({
        // ******* 评论通用项 ************
        // 评论内容
        content: { type: String, required: true, validate: /\S+/ },
        // marked渲染后的内容
        renderedContent: { type: String, required: true, validate: /\S+/ },
        // 状态 -2 垃圾评论 | -1 已删除 | 0 待审核 | 1 通过
        state: {
            type: Number,
            default: commentValidateConfig.state.default,
            validate: val => Object.values(commentValidateConfig.state.optional).includes(val)
        },
        // Akismet判定是否是垃圾评论，方便后台check
        spam: { type: Boolean, default: false },
        // 评论发布者
        author: { type: Schema.Types.ObjectId, ref: 'User' },
        // 点赞数
        ups: { type: Number, default: 0, validate: /^\d*$/ },
        // 是否置顶
        sticky: { type: Boolean, default: false },
        // 类型 0 文章评论 | 1 站内留言 | 2 其他（保留）
        type: {
            type: Number,
            default: commentValidateConfig.type.default,
            validate: val => Object.values(commentValidateConfig.type.optional).includes(val)
        },
        // type为0时此项存在
        article: { type: Schema.Types.ObjectId, ref: 'Article' },
        meta: {
            // 用户IP
            ip: String,
            // IP所在地
            location: Object,
            // user agent
            ua: { type: String, validate: /\S+/ },
            // refer
            referer: { type: String, default: '' }
        },
        // ******** 子评论具备项 ************
        // 父评论
        parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // 父评论 parent和forward二者必须同时存在
        // 评论的上一级
        forward: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } // 前一条评论ID，可以是parent的id， 比如 B评论 是 A评论的回复，则B.forward._id = A._id，主要是为了查看评论对话时的评论树构建
    })

    return mongoose.model('Comment', app.processSchema(CommentSchema, {
        paginate: true
    }, {
        pre: {
            save (next) {
                if (this.content) {
                    this.renderedContent = app.utils.markdown.render(this.content)
                }
                next()
            },
            async findOneAndUpdate () {
                delete this._update.updatedAt
                const { content } = this._update
                const find = await this.model.findOne(this._conditions)
                if (find) {
                    if (content && content !== find.content) {
                        this._update.renderedContent = app.utils.markdown.render(content)
                        this._update.updatedAt = Date.now()
                    }
                }
            }
        }
    }))
}
