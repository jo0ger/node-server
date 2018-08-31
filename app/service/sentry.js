const { Service } = require('egg') 

module.exports = class SentryService extends Service {
    /**
     * filter errors need to be submitted to sentry
     *
     * @param {any} err error
     * @return {boolean} true for submit, default true
     * @memberof SentryService
     */
    judgeError (err) {
        // ignore HTTP Error
        return !(err.status && err.status >= 500)
    }

    // user information
    get user () {
        return this.app._admin
    }

    get extra () {
        return {
            ip: this.ctx.ip,
            payload: this.ctx.request.body,
            query: this.ctx.query,
            params: this.ctx.params
        }
    }

    get tags () {
        return {
            url: this.ctx.request.url
        }
    }
}
