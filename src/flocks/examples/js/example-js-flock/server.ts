#!/usr/bin/env node
import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'

async function run () {
  const sock = new zmq.Reply()
  await sock.bind('tcp://127.0.0.1:3000')

  for await (const [msg] of sock) {
    const inobj: any = decode(msg)
    const data: any = decode(inobj.data)
    const retval = 2 * parseInt(data.toString(), 10)
    await sock.send(encode(retval))
  }
}

run()
