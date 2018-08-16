/**
 * @desc 分类模型
 */
import { Application } from 'egg'

export default (app: Application) => {
    const { STRING, DATE, INTEGER } = app.Sequelize
    return app.model.define('category', {
        id: {
            type: INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        created_at: { type: DATE },
        updated_at: { type: DATE },
        name: {
            type: STRING(255),
            allowNull: false
        },
        desc: {
            type: STRING,
            defaultValue: ''
        },
        icon: {
            type: STRING,
            defaultValue: ''
        }
    })
}