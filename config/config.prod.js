module.exports = () => {
    const config = exports = {}

    config.security = {
        csrf: {
            headerName: 'x-csrf-token',
            cookieName: 'csrfToken'
        },
        domainWhiteList: [
            '*.jooger.me'
        ]
    }

    config.session = {
        domain: '.jooger.me'
    }

    config.console = {
        debug: false,
        error: false
    }

    config.sentry = {
        dsn: 'https://43ea4130c7684fb3aa86404172cf67a1@sentry.io/1272403'
    }

    return config
}
