const assert = require('assert')
const BlockApp = require('../app')

describe('BlockApp', function () {
  let app
  before(async function () {
    app = new BlockApp.BlockApp('tcp://127.0.0.1:3000')
    app.run()
  })
  after(function () {
    app.shutdown()
  })

  describe('test1', function () {
    it('processTxn', async function () {
      assert.ok(!await app.processTxn({ cmd: 'foo', data: 'bar' }))
    })
  })
})
