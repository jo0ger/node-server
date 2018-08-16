/**
 * @desc 标签模型
 */
import { Application } from 'egg'

export default (app: Application) => {
    const { STRING, INTEGER, DATE } = app.Sequelize
    return app.model.define('tag', {
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