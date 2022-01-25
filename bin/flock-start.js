#!/usr/bin/env node

const assert = require('assert')
const FlockCli = require('pigeon-sdk/js/flock-cli')
const FlockManager = require('../src/manager/flock-manager')
let cli, app

app = new FlockManager.FlockManager('tcp://127.0.0.1:3000')
cli = new FlockCli.FlockCli('tcp://127.0.0.1:3000')
app.run()

async function main() {
  const beacon = await cli.send('run localhost/pigeon-beacon')
  console.log(beacon)
  const port = await cli.send('port ' + beacon)
  console.log(port[0][1])
  cli.readline()
}

main()
