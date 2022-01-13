#!/usr/bin/env node
import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'
import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')
import createLogger from 'logging';
const logger = createLogger('blockapp');

async function runReply (
  blockchain : any,
  sock : zmq.Reply,
  pubSock : zmq.Publisher
) : Promise<void> {
  for await (const [msg] of sock) {
    const inobj: any = decode(msg)
    let retval
    logger.debug('received command ' + inobj.cmd)
    if (inobj.cmd === 'echo') {
      retval = inobj.data
    } else if (inobj.cmd === 'blockchain') {
      const { hash: previousHash } = blockchain.latestBlock
      retval = await blockchain.addBlock(inobj.data, previousHash)
      pubSock.send(encode(retval))
    } else {
      retval = 'unknown command'
    }
    await sock.send(encode(retval))
  }
}

async function main () : Promise<void> {
  const replySock = new zmq.Reply()
  const pubSock = new zmq.Publisher()
  await replySock.bind('tcp://127.0.0.1:3000')
  await pubSock.bind('tcp://127.0.0.1:3001')
  const bc = await new blockchain.AsyncBlockchain()
  logger.info('starting blockchain')
  runReply(bc, replySock, pubSock)
}

main()
