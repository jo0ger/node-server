/**
 * @desc 分类模型
 */
import { Application } from 'egg'

export default (app: Application) => {
    const { STRING } = app.Sequelize
    return app.model.define('category', app.schemaWrapper({
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
    }))
}