const assert = require('assert')
const Cli = require('../cli')
const FlockManager = require('../flock-manager')

describe('Manager', function () {
  let cli, app
  before(async function () {
    app = new FlockManager.FlockManager('tcp://127.0.0.1:3000')
    cli = new Cli.Cli('tcp://127.0.0.1:3000')
    app.run()
  })
  after(function () {
    app.shutdown()
  })

  describe('echo', function () {
    it('echo', async function () {
      const r = await cli.send('echo hello world')
      assert.equal(r, 'hello world')
    })
    it('list', async function () {
      const r = await cli.send('list')
      assert.ok(r.includes('localhost/pigeon-beacon'))
    })
    it('run', async function () {
      const r = await cli.send('run localhost/pigeon-beacon')
      assert.ok(r.match(/[0-9a-f]+/))
    })
    it('ps', async function () {
      const r = await cli.send('ps')
      assert.ok(r.includes('localhost/pigeon-beacon'))
    })
  })
})
