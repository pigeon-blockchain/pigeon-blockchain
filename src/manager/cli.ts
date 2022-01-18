#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import zmq = require('zeromq')
import readline = require('readline');
import { encode, decode } from '@msgpack/msgpack'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function mySplit (
  string: string,
  delimiter: string,
  n: number
) {
  const parts = string.split(delimiter)
  return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)])
}

class Cli {
  run () : void {
    const sock = new zmq.Request()
    sock.connect('tcp://127.0.0.1:3000')
    console.log('Producer bound to port 3000')
    const asyncReadline = function () {
      rl.question('Command: ', async function (answer) {
        const [cmdfull, data] = mySplit(answer, ' ', 2)
        const [cmd, subcmd] = mySplit(cmdfull, '.', 2)
        sock.send(encode({
          cmd: cmd,
          subcmd: subcmd,
          data: data
        }))
        const [result] = await sock.receive()
        console.log(decode(result))
        asyncReadline()
      })
    }
    asyncReadline()
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  const cli = new Cli()
  cli.run()
}
