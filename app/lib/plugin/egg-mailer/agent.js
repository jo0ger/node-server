module.exports = agent => {
    if (agent.config.mailer.agent) require('./lib/mailer')(agent)
}
