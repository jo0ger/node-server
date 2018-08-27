module.exports = app => {
    if (app.config.mailer.app) require('./lib/mailer')(app)
}
