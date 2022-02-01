#!/usr/bin/env node

const { FlockCli } = require('../src/pigeon-sdk/js/flock-cli')
const { FlockManager } = require('../src/manager/flock-manager')

const app = new FlockManager({ conport: 'tcp://127.0.0.1:3000' })
const cli = new FlockCli()
app.run()

async function main () {
  await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  let p = await cli.send('run localhost/pigeon-beacon')
  let portConnectString = await cli.send(`port-connect-string ${p}`)
  await cli.portConnect('beacon', portConnectString[0])
  p = await cli.send('run localhost/js-algebra')
  portConnectString = await cli.send(`port-connect-string ${p}`)
  await cli.portConnect('js-algebra', portConnectString[0])
  cli.readline()
}

main()
