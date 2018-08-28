const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/service/category.test.js', () => {
    let ctx,
        categoryService,
        category

    before(() => {
        ctx = app.mockContext()
        categoryService = ctx.service.category
    })

    it('create pass', async () => {
        const name = '测试分类'
        const description = '测试分类描述'
        const exts = [{ key: 'icon', value: 'fa-fuck' }]
        const data = await categoryService.create({ name, description, extends: exts })
        assert(data.name === name)
        assert(data.description === description)
        assert(data.extends.length === exts.length && data.extends[0].key === exts[0].key && data.extends[0].value === exts[0].value)
        category = data
    })

    it('getList pass', async () => {
        const query = {}
        const data = await categoryService.getList(query)
        assert.equal(data.every(item => 'count' in item), true)
    })

    it('getItem pass', async () => {
        const find = await categoryService.getItem({ name: category.name })
        assert.equal(find._id.toString(), category._id.toString())
        assert.equal(find.name, category.name)
        assert.equal(find.description, category.description)
    })

    it('getItemById pass', async () => {
        const find = await categoryService.getItemById(category._id)
        assert.equal(find._id.toString(), category._id.toString())
        assert.equal(find.name, category.name)
        assert.equal(find.description, category.description)
    })

    it('updateItemById pass', async () => {
        const update = {
            name: '测试分类修改',
            description: '测试分类描述修改',
            extends: [{ key: 'icon', value: 'fa-fuck-m' }]
        }
        const data = await categoryService.updateItemById(category._id, update)
        assert.equal(data._id.toString(), category._id.toString())
        assert.equal(data.name, update.name)
        assert.equal(data.description, update.description)
        assert(data.extends.length === update.extends.length && data.extends[0].key === update.extends[0].key && data.extends[0].value === update.extends[0].value)
        assert.notEqual(data.name, category.name)
        assert.notEqual(data.description, category.description)
        assert(data.extends[0].key === category.extends[0].key && data.extends[0].value !== category.extends[0].value)
    })

    it('deleteItemById pass', async () => {
        const data = await categoryService.deleteItemById(category._id)
        assert.equal(data._id.toString(), category._id.toString())
        const find = await categoryService.getItemById(category._id)
        assert.equal(find, null)
    })
})
