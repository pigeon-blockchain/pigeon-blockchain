#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'
import 'regenerator-runtime/runtime'
import EventEmitter = require('events')

module.exports = class FlockServer {
  sock: zmq.Reply;
  pubSock: zmq.Publisher;
  emitter: EventEmitter;

  constructor (
    sock : zmq.Reply,
    pubSock : zmq.Publisher
  ) {
    this.sock = sock
    this.pubSock = pubSock
    this.emitter = new EventEmitter()
  };

  addEvents (): void {
  }

  async run () : Promise<void> {
    for await (const [msg] of this.sock) {
      const inobj: any = decode(msg)
      if (!this.emitter.emit(inobj.cmd, inobj.data)) {
        this.send('unknown command')
      }
    }
  }

  async send (data: any) {
    this.sock.send(encode(data))
  }

  async publish (data: any) {
    this.pubSock.send(encode(data))
  }

  async shutdown () : Promise<void> {
    process.exit(0)
  }
}
