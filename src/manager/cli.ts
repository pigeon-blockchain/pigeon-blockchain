#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import zmq = require('zeromq')
import readline = require('readline');
import { encode, decode } from '@msgpack/msgpack'
import { createLogger, format, transports } from 'winston'

const myTransports = {
  file: new transports.File({ filename: 'cli.log' }),
  console: new transports.Console()
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    myTransports.file,
    myTransports.console
  ]
})

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
  sock: zmq.Request;
  constructor (
    connectId: string
  ) {
    this.sock = new zmq.Request()
    this.sock.connect(connectId)
    logger.log('info', 'Cli bound to %s', connectId)
  }

  async send (command: string): Promise<any> {
    const [cmdfull, data] = mySplit(command, ' ', 2)
    const [cmd, subcmd] = mySplit(cmdfull, '.', 2)
    this.sock.send(encode({
      cmd: cmd,
      subcmd: subcmd,
      data: data
    }))
    const [result] = await this.sock.receive()
    return decode(result)
  }

  async readline (): Promise<void> {
    const me = this
    rl.question('Command: ', async function (answer) {
      const result = await me.send(answer)
      console.log(result)
      me.readline()
    })
  }

  run () : void {
    this.readline()
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  const cli = new Cli('tcp://localhost:3000')
  cli.run()
}
