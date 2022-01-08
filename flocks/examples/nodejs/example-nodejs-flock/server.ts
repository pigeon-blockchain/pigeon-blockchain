#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import util = require('util')
const execShPromise = require("exec-sh").promise;
var pod : string = "";

async function run() {
  const sock = new zmq.Reply
  await sock.bind("tcp://127.0.0.1:3000")

  for await (const [msg] of sock) {
    const inobj: any = decode(msg);
    const retval = 2 * parseInt(decode(inobj.data).toString());
    await sock.send(encode(retval))
  }
}

run()
