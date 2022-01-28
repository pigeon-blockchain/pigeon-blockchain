import assert from 'assert'
import { FlockCli } from 'pigeon-sdk/js/flock-cli'
import { FlockManager } from '../flock-manager'
let app: FlockManager
let cli: FlockCli

describe('Manager', function () {
  before(async function () {
    app = new FlockManager({
      conport: 'tcp://127.0.0.1:3000'
    })
    cli = new FlockCli()
    app.run()
    await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  })

  after(async function () {
    app.stopAll()
  })

  describe('echo', function () {
    let beacon : string
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
    let port : string
    it('port', async () => {
      const r = await cli.send('port ' + beacon)
      assert.equal(r[0][0], '3000/tcp')
      assert.match(r[0][1], /0\.0\.0\.0:[0-9]+/)
      port = r[0][1].split(':')[1]
    })
    it('.port-connect', async () => {
      await cli.send('.port-connect blockchain ' + port)
    })
    it('.port-connect', async () => {
      const r = await cli.send('.port-list')
      assert.equal(r.blockchain, 'tcp://127.0.0.1:' + port.toString())
    })
    it('stop --all', async function () {
      await cli.send('.port tcp://127.0.0.1:3000')
      await cli.send('stop --all')
    })
    it('version', async () => {
      const r = await cli.send('version')
      assert.equal(r, 'FlockManager')
    })
  })
})
