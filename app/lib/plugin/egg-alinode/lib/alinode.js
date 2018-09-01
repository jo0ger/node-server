const assert = require('assert')
const AlinodeAgent = require('agentx')
const homedir = require('node-homedir')
const fs = require('fs')
const path = require('path')

module.exports = agent => {
    agent.addSingleton('alinode', createClient)
}

function createClient (config, agent) {
    if (!config.enable) {
        agent.coreLogger.info('[egg-alinode] disable')
        return
    }
    assert(config.appid, 'config.alinode.appid required')
    assert(config.secret, 'config.alinode.secret required')

    const nodepathFile = path.join(homedir(), '.nodepath')
    const nodeBin = path.dirname(process.execPath)
    fs.writeFileSync(nodepathFile, nodeBin)
    config.logger = agent.coreLogger
    config.libMode = true
    const client = new AlinodeAgent(config)
    agent.beforeStart(async () => {
        agent.coreLogger.info('[egg-alinode] alinode agentx started, node versions: %j, update %s with %j, config: %j',
            process.versions,
            nodepathFile,
            nodeBin, {
                server: config.server,
                appid: config.appid,
            }
        )
    })
    return {
        client,
        config,
        run () {
            return this.client.run()
        },
        restart (config) {
            this.client = new AlinodeAgent(config || this.config)
            this.config = config
        }
    }
}
