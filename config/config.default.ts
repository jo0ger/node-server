import {
    EggAppConfig,
    EggAppInfo,
    PowerPartial
} from 'egg';

// for config.{env}.ts
export type DefaultConfig = PowerPartial < EggAppConfig & BizConfig > ;

// app special config scheme
export interface BizConfig {
    sourceUrl: string;
}

export default (appInfo: EggAppInfo) => {
    const config = {} as PowerPartial < EggAppConfig > & BizConfig;

    // app special config
    config.sourceUrl = `https://github.com/eggjs/examples/tree/master/${appInfo.name}`;

    // override config from framework / plugin
    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1534318513270_6556';

    // add your config here
    config.middleware = ['graphql'];

    // config.graphql = {
    //     router: '/graphql',
    //     // 是否加载到 app 上，默认开启
    //     app: true,
    //     // 是否加载到 agent 上，默认关闭
    //     agent: false,
    // }

    config.sequelize = {
        dialect: 'mysql',
        database: 'node-server',
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: '19950102',
    }

    // config.mongoose = {
    //     client: {
    //         url: 'mongodb://127.0.0.1:27017/node-server',
    //         options: {
    //             poolSize: 20,
    //             keepAlive: true,
    //             autoReconnect: true,
    //             reconnectInterval: 1000,
    //             reconnectTries: Number.MAX_VALUE,
    //             useNewUrlParser: true
    //         }
    //     }
    // }

    config.security = {
        csrf: {
            ignore: () => true,
        }
    }

    return config;
};
