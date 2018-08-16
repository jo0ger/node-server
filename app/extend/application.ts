import { INTEGER, DefineAttributes, DATE } from 'sequelize'

export default {
    schemaWrapper (schema: DefineAttributes): DefineAttributes {
        return Object.assign({
            id: {
                type: INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            created_at: { type: DATE },
            updated_at: { type: DATE }
        }, schema)
    }
}