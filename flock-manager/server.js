#!/usr/bin/env node
const zmq = require("zeromq")
const { encode, decode } = require("@msgpack/msgpack");

async function run() {
  const sock = new zmq.Reply
  await sock.bind("tcp://127.0.0.1:3000")

  for await (const [msg] of sock) {
    const object = parseInt(decode(msg));
    await sock.send(encode(2 * object))
  }
}

run()
