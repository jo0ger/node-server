const { app, assert } = require('egg-mock/bootstrap')

describe('test/app/service/tag.test.js', () => {
    let ctx,
        tagService,
        tag

    before(() => {
        ctx = app.mockContext()
        tagService = ctx.service.tag
    })

    it('create pass', async () => {
        const name = '测试标签'
        const description = '测试标签描述'
        const exts = [{ key: 'icon', value: 'fa-fuck' }]
        const data = await tagService.create({ name, description, extends: exts })
        assert(data.name === name)
        assert(data.description === description)
        assert(data.extends.length === exts.length && data.extends[0].key === exts[0].key && data.extends[0].value === exts[0].value)
        tag = data
    })

    it('getList pass', async () => {
        const query = {}
        const data = await tagService.getList(query)
        assert.equal(data.every(item => 'count' in item), true)
    })

    it('getItem pass', async () => {
        const find = await tagService.getItem({ name: tag.name })
        assert.equal(find._id.toString(), tag._id.toString())
        assert.equal(find.name, tag.name)
        assert.equal(find.description, tag.description)
    })

    it('getItemById pass', async () => {
        const find = await tagService.getItemById(tag._id)
        assert.equal(find._id.toString(), tag._id.toString())
        assert.equal(find.name, tag.name)
        assert.equal(find.description, tag.description)
    })

    it('updateItemById pass', async () => {
        const update = {
            name: '测试标签修改',
            description: '测试标签描述修改',
            extends: [{ key: 'icon', value: 'fa-fuck-m' }]
        }
        const data = await tagService.updateItemById(tag._id, update)
        assert.equal(data._id.toString(), tag._id.toString())
        assert.equal(data.name, update.name)
        assert.equal(data.description, update.description)
        assert(data.extends.length === update.extends.length && data.extends[0].key === update.extends[0].key && data.extends[0].value === update.extends[0].value)
        assert.notEqual(data.name, tag.name)
        assert.notEqual(data.description, tag.description)
        assert(data.extends[0].key === tag.extends[0].key && data.extends[0].value !== tag.extends[0].value)
    })

    it('deleteItemById pass', async () => {
        const data = await tagService.deleteItemById(tag._id)
        assert.equal(data._id.toString(), tag._id.toString())
        const find = await tagService.getItemById(tag._id)
        assert.equal(find, null)
    })
})
