#!/usr/bin/env node
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

async function run () {
  const sock = new zmq.Request()
  sock.connect('tcp://127.0.0.1:3000')
  console.log('Producer bound to port 3000')
  const asyncReadline = function () {
    rl.question('Command: ', async function (answer) {
      const [cmd, data] = mySplit(answer, ' ', 2)
      sock.send(encode({ cmd: cmd, data: data }))
      const [result] = await sock.receive()
      console.log(decode(result))
      asyncReadline()
    })
  }
  asyncReadline()
}

run()
