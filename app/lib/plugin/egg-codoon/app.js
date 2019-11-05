module.exports = app => {
    if (app.config.codoon.app) require('./lib/codoon')(app)
}
