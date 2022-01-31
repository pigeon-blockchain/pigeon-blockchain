#!/usr/bin/env node

import { FlockCli } from '../../src/pigeon-sdk/js/flock-cli'
import { FlockManager } from '../../src/manager/flock-manager'

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
    let controlPort // publishPort
    portrep.forEach((l: any) => {
      if (l[0] === '3000/tcp') {
        controlPort = l[1].split(':')[1]
      } else if (l[0] === '3001/tcp') {
        //      publishPort = l[1].split(':')[1]
      }
    })
    await cli.portConnect('beacon', `tcp://127.0.0.1:${controlPort}`)
  })
})

