#!/usr/bin/env node

import { FlockCli } from '../../src/pigeon-sdk/js/flock-cli'
import { FlockManager } from '../../src/manager/flock-manager'
import assert from 'assert'

describe('Test', () => {
  let app: FlockManager, cli: FlockCli
  before(async () => {
    app = new FlockManager({ conport: 'tcp://127.0.0.1:3000' })
    cli = new FlockCli()
    app.run()
    app.runBeacon()
    await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  })
  it('port', async() => {
    const beacon = await cli.send('run localhost/pigeon-beacon')
    const portrep = await cli.send(`port ${beacon}`)
    const portConnectString = await cli.send(`port-connect-string ${beacon}`)
     await cli.portConnect('beacon', portConnectString[0])
  })
  it('beacon/block', async() => {
    const r = await cli.send('beacon/block {"foo": "bar"}')
    assert.deepEqual(r.data, {foo: 'bar'})
  })
})

