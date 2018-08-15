/**
 * @desc 文章模型
 */
import { Application } from 'egg'

export default (app: Application) => {
    const { INTEGER, STRING, ARRAY, ENUM, Deferrable } = app.Sequelize
    return app.model.define('article', app.schemaWrapper({
        title: {
            type: STRING(255),
            allowNull: false
        },
        desc: {
            type: STRING,
            defaultValue: ''
        },
        keywords: ARRAY(STRING),
        content: {
            type: STRING,
            allowNull: false
        },
        rendered_content: {
            type: STRING,
            allowNull: false
        },
        thumb: {
            type: STRING,
            allowNull: true,
            validate: {
                isUrl: true
            }
        },
        // 文章状态 （ 0 草稿 | 1 已发布 ）
        state: {
            type: ENUM,
            values: ['0', '1']
        },
        permalink: {
            type: STRING,
            allowNull: false,
            validate: {
                isUrl: true
            }
        },
        pvs: {
            type: INTEGER,
            defaultValue: 0
        },
        ups: {
            type: INTEGER,
            defaultValue: 0
        },
        comments: {
            type: INTEGER,
            defaultValue: 0
        },
        category_id: {
            type: INTEGER,
            references: {
                model: 'category',
                key: 'id',
                deferrable: Deferrable.INITIALLY_IMMEDIATE
            }
        }
    }))
}
