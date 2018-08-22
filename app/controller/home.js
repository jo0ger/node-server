'use strict';

const Controller = require('egg').Controller;

const createRule = {
    username: {
        type: 'email',
    },
    password: {
        type: 'password',
        compare: 're-password',
    },
}

class HomeController extends Controller {
    async index() {
        // this.ctx.validate(createRule)
        // this.ctx.body = this.ctx.request.body
        this.ctx.throw(200, '标签已经存在' )
        this.ctx.fail(404)
    }
}

module.exports = HomeController;
