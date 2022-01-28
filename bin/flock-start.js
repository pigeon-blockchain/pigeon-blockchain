#!/usr/bin/env node

const assert = require('assert')
const { FlockCli } = require('../src/pigeon-sdk/js/flock-cli')
const { FlockManager } = require('../src/manager/flock-manager')
let cli, app

app = new FlockManager({conport: 'tcp://127.0.0.1:3000'})
cli = new FlockCli()
app.run()

async function main() {
  await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  const beacon = await cli.send('run localhost/pigeon-beacon')
  let portrep = await cli.send('port ' + beacon)
  let port
  portrep.forEach((l) => {
    if (l[0] === '3000/tcp') {
      port = l[1].split(':')[1]
    }
  })
  await cli.portConnect('beacon', 'tcp://127.0.0.1:' + port)
  cli.readline()
}

main()
