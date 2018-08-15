import { SequelizeStatic, Sequelize, DefineAttributes } from 'sequelize'

declare module 'egg' {
    interface Application {
        Sequelize: SequelizeStatic;
        model: Sequelize;
        schemaWrapper: (schema: DefineAttributes) => DefineAttributes;
    }
}