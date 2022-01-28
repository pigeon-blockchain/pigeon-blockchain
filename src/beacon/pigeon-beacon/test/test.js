const assert = require('assert')
const BlockApp = require('../app')
const FlockCli = require('pigeon-sdk/js/flock-cli')

describe('BlockApp', function () {
  let app
  before(async function () {
    app = new BlockApp.BlockApp({
      conport: 'tcp://127.0.0.1:3000'
    })
    cli = new FlockCli.FlockCli('tcp://127.0.0.1:3000')
    app.run()
  })
  after(function () {
    app.shutdown()
  })

  describe('test1', function () {
    it('processTxn', async function () {
      assert.ok(!await app.processTxn({ cmd: 'foo', data: 'bar' }))
    })
    it('block', async function () {
      const r = await cli.send('block foobar')
      assert.ok(!await app.processTxn(r.data === 'foobar'))
    })
  })
})
