module.exports = agent => {
    agent.logger.info(333)
    agent.messenger.on('egg-ready', () => {
    })
}
