#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import util = require('util')
import blockchain = require('vanilla-blockchain')
var pod : string = "";


async function run_reply(sock) : Promise<void> {
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


async function run_pub(sock) : Promise<void> {
  while (true) {
    await sock.send(["kitty cats", "meow!"])
    await new Promise(resolve => setTimeout(resolve, 10000))
  }
}


async function main() : Promise<void> {
  const reply_sock = new zmq.Reply
  const pub_sock = new zmq.Publisher
  await reply_sock.bind("tcp://127.0.0.1:3000")
  await pub_sock.bind("tcp://127.0.0.1:3001")
  run_reply(reply_sock)
  run_pub(pub_sock)
}

main()
