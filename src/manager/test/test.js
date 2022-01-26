const assert = require('assert')
const FlockCli = require('pigeon-sdk/js/flock-cli')
const FlockManager = require('../flock-manager')
let cli, app

describe('Manager', function () {
  before(async function () {
    app = new FlockManager.FlockManager('tcp://127.0.0.1:3000')
    cli = new FlockCli.FlockCli()
    cli.port('tcp://127.0.0.1:3000')
    app.run()
  })

  after(async function () {
    app.shutdown()
  })

  describe('echo', function () {
    let beacon
    it('echo', async function () {
      const r = await cli.send('echo hello world')
      assert.equal(r, 'hello world')
    })
    it('list', async function () {
      const r = await cli.send('list')
      assert.ok(r.includes('localhost/pigeon-beacon'))
    })
    it('run', async function () {
      beacon = await cli.send('run localhost/pigeon-beacon')
      assert.ok(beacon.match(/[0-9a-f]+/))
    })
    it('ps', async function () {
      const r = await cli.send('ps')
      assert.ok(r.includes('localhost/pigeon-beacon'))
    })
    it('port', async () => {
      const r = await cli.send('port ' + beacon)
      assert.equal(r[0][0], '3000/tcp')
      assert.match(r[0][1], /0\.0\.0\.0:[0-9]+/)
    })
    it('stop --all', async function () {
      await cli.send('stop --all')
    })
    it('version', async () => {
      const r = await cli.send('version')
      assert.equal(r, 'FlockManager')
    })
  })
})
