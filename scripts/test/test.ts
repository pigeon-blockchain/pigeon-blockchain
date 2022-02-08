#!/usr/bin/env node

import { FlockCli } from '../../packages/columba-sdk/js'
import { FlockManager } from '../../packages/manager'
import assert from 'assert'

const app = new FlockManager({
  conport: 'tcp://127.0.0.1:3000',
  beaconprefix: 'tcp://127.0.0.1'
})
const cli = new FlockCli()
let beaconPortConnect : any

async function runConnect (image: string, connect: string) {
  const p = await cli.send(`run ${image}`)
  console.log(`starting ${image}`)
  console.log(`  ${p}`)
  const portConnect = await cli.send(`port-connect ${p}`)
  console.log(portConnect)
  await cli.portConnect(connect, portConnect[0])
  if (beaconPortConnect !== undefined) {
    const r = await cli.send(`${connect}/beacon-connect [${beaconPortConnect[0]}, ${beaconPortConnect[1]}]`)
    console.log(r)
  }
  if (connect === 'beacon') {
    beaconPortConnect = portConnect
    console.log(`beacon-connect [${beaconPortConnect[0]}, ${beaconPortConnect[1]}]`)
  }

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
  it('port', async () => {
    await runConnect('localhost/columba-beacon', 'beacon')
    const r = await cli.send('beacon/block {"foo": "bar"}')
    assert.deepEqual(r.data, { foo: 'bar' })
  })
  it('jsalgebra', async () => {
    await runConnect('localhost/js-algebra', 'js-algebra')
  })
})
