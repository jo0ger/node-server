import { INTEGER, DATE, DefineAttributes } from 'sequelize'

export function schemaWrapper (schema: DefineAttributes): DefineAttributes {
    return Object.assign({
        id: {
            type: INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        created_at: { type: DATE, defaultValue: Date.now() },
	    updated_at: { type: DATE, defaultValue: Date.now() }
    }, schema)
}