import {
    EggPlugin
} from 'egg'

const plugin: EggPlugin = {
    sequelize: {
        enable: true,
        package: 'egg-sequelize'
    },
    graphql: {
        enable: true,
        package: 'egg-graphql',
    },
    validate: {
        enable: true,
        package: 'egg-validate'
    }
};

export default plugin
