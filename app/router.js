module.exports = app => {
    const { router, config } = app

    router.get('/', async ctx => {
        ctx.body = {
            name: config.name,
            version: config.version,
            author: config.pkg.author,
            github: 'https://github.com/jo0ger',
            site: config.author.url,
            poweredBy: ['Egg', 'Koa2', 'MongoDB', 'Nginx', 'Redis']
        }
    })

    require('./router/backend')(app)
    require('./router/frontend')(app)
    router.all('*', ctx => {
        const code = 404
        ctx.fail(code, app.config.codeMap[code])
    })
}

