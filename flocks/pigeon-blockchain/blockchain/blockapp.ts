#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')

async function run_reply(
  blockchain : any,
  sock : zmq.Reply,
  pub_sock : zmq.Publisher
) : Promise<void> {
  for await (const [msg] of sock) {
    const inobj: any = decode(msg);
    var retval;
    if (inobj.cmd == "echo") {
      retval = inobj.data;
    } else if (inobj.cmd == "blockchain") {
      const { hash: previousHash } = blockchain.latestBlock;
      retval = await blockchain.addBlock( inobj.data, previousHash );
      pub_sock.send(encode(retval))
    } else {
      retval = "unknown command";
    }
    await sock.send(encode(retval))
  }
}

async function main() : Promise<void> {
  const reply_sock = new zmq.Reply
  const pub_sock = new zmq.Publisher
  await reply_sock.bind("tcp://127.0.0.1:3000")
  await pub_sock.bind("tcp://127.0.0.1:3001")
  const bc = await new blockchain.AsyncBlockchain();
  console.log('starting blockchain')
  run_reply(bc, reply_sock, pub_sock)
}

main()
