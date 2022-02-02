#!/usr/bin/env node

const { FlockCli } = require('../src/pigeon-sdk/js/flock-cli')
const { FlockManager } = require('../src/manager/flock-manager')

const app = new FlockManager({ conport: 'tcp://127.0.0.1:3000' })
const cli = new FlockCli()
let beaconPortConnect : any;
app.run()

async function runConnect(image: string, connect: string) {
  const p = await cli.send(`run ${image}`)
  console.log(`starting ${image}`)
  console.log(`  ${p}`)
  const portConnectString = await cli.send(`port-connect-string ${p}`)
  await cli.portConnect(connect, portConnectString[0])
  if (beaconPortConnect !== undefined) {
    await cli.send(`beacon-connect ["${beaconPortConnect[0]}", "${beaconPortConnect[1]}"]`)
  }
  if (connect === 'beacon') {
    beaconPortConnect = portConnectString.map( (s: string)=> {
      return s.replace('127.0.0.1', 'host.containers.internal')
    })
    console.log(`beacon-connect ["${beaconPortConnect[0]}", "${beaconPortConnect[1]}"]`)
  }

  return p
}

async function main () {
  await cli.portConnect('default', 'tcp://127.0.0.1:3000')
  await runConnect('localhost/pigeon-beacon', 'beacon')
  await runConnect('localhost/js-algebra', 'js-algebra')
  cli.readline()
}

main()
