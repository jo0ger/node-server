module.exports = app => {
    if (app.config.akismet.app) require('./lib/akismet')(app)
}