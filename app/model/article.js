/**
 * @desc 文章模型
 */

module.exports = app => {
    const { mongoose, config } = app
    const { Schema } = mongoose
    const articleValidateConfig = config.modelValidate.article

    const ArticleSchema = new Schema({
        // 文章标题
        title: { type: String, required: true },
        // 文章关键字（FOR SEO）
        keywords: [{ type: String }],
        // 文章摘要 (FOR SEO)
        description: { type: String, default: '' },
        // 文章原始markdown内容
        content: { type: String, required: true, validate: /\S+/ },
        // markdown渲染后的htmln内容
        renderedContent: { type: String, required: true, validate: /\S+/ },
        // 分类
        category: { type: Schema.Types.ObjectId, ref: 'Category' },
        // 标签
        tag: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
        // 缩略图 （图片uid, 图片名称，图片URL， 图片大小）
        thumb: { type: String, validate: /.+?\.(jpg|jpeg|gif|bmp|png)/ },
        // 文章状态 （ 0 草稿 | 1 已发布 ）
        state: {
            type: Number,
            default: articleValidateConfig.state.default,
            validate: (val) => {
                return Object.values(articleValidateConfig.state.optional).includes(val)
            }
        },
        // 永久链接
        permalink: { type: String, validate: /\S+/ },
        // 创建日期
        createdAt: { type: Date, default: Date.now },
        // 更新日期
        updatedAt: { type: Date, default: Date.now },
        // 发布日期
        publishedAt: { type: Date, default: Date.now },
        // 文章元数据 （浏览量， 喜欢数， 评论数）
        meta: {
            pvs: { type: Number, default: 0, validate: /^\d*$/ },
            ups: { type: Number, default: 0, validate: /^\d*$/ },
            comments: { type: Number, default: 0, validate: /^\d*$/ }
        }
    })

    return mongoose.model('Article', app.processSchema(ArticleSchema))
}
