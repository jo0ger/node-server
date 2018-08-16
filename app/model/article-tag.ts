/**
 * @desc 文章-标签关联模型
 */
import { Application } from 'egg'

export default (app: Application) => {
    const { INTEGER, Deferrable } = app.Sequelize
    return app.model.define('article_tag', {
        id: {
            type: INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        article_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'articles',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        },
        tag_id: {
            type: INTEGER,
            allowNull: false,
            references: {
                model: 'tags',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        }
    })
}