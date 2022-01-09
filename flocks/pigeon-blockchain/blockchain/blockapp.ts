#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import util = require('util')
import blockchain = require('vanilla-blockchain')
var pod : string = "";

async function run() {
  const sock = new zmq.Reply
  await sock.bind("tcp://127.0.0.1:3000")
  for await (const [msg] of sock) {
    const inobj: any = decode(msg);
    var retval;
    if (inobj.cmd == "help") {
      retval = "help string";
    } else if (inobj.cmd == "echo") {
      retval = inobj.data;
    } else if (inobj.cmd == "test") {
      retval = 2 * parseInt(decode(inobj.data).toString());
    } else {
      retval = "unknown command";
    }
    await sock.send(encode(retval))
  }
}

run()
