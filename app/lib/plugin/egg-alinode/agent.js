module.exports = agent => {
    agent.logger.info(333)
    agent.messenger.on('egg-ready', () => {
        agent.logger.info(222)
        agent.messenger.on('alinode-run', config => {
            agent.logger.info(111)
        })
    })
}
