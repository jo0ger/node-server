module.exports = agent => {
  if (agent.config.akismet.agent) require('./lib/akismet')(agent)
}
