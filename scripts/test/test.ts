#!/usr/bin/env node

import { FlockCli } from '../../src/pigeon-sdk/js/flock-cli'
import { FlockManager } from '../../src/manager/flock-manager'
import assert from 'assert'

const app = new FlockManager({ conport: 'tcp://127.0.0.1:3000' })
const cli = new FlockCli()

async function runConnect(image: string, connect: string) {
  const p = await cli.send(`run ${image}`)
  const portConnectString = await cli.send(`port-connect-string ${p}`)
  await cli.portConnect(connect, portConnectString[0])
  return p
}

describe('Test', () => {
  before(async () => {
    app.run()
    await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  })
  after(async () => {
    app.stopAll()
  })
  it('port', async() => {
    await runConnect('localhost/pigeon-beacon', 'beacon')
    const r = await cli.send('beacon/block {"foo": "bar"}')
    assert.deepEqual(r.data, {foo: 'bar'})
  })
  it('jsalgebra', async() => {
    await runConnect('localhost/js-algebra', 'js-algebra')
  })
})
