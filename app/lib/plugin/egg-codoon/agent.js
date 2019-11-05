module.exports = agent => {
    if (agent.config.codoon.agent) require('./lib/codoon')(agent)
}
