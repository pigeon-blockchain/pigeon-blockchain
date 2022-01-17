#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'
import 'regenerator-runtime/runtime'
import EventEmitter = require('events')

export default class FlockServer {
  replySockId: string
  pubSockId: string
  replySock : zmq.Reply
  pubSock : zmq.Publisher
  emitter: EventEmitter
  initialized: boolean

  constructor (
    replySockId: string,
    pubSockId: string
  ) {
    this.replySockId = replySockId
    this.pubSockId = pubSockId
    this.replySock = new zmq.Reply()
    this.pubSock = new zmq.Publisher()

    this.emitter = new EventEmitter()
    this.initialized = false
  };

  async initialize (): Promise<void> {
    await this.replySock.bind(this.replySockId)
    await this.pubSock.bind(this.pubSockId)
  }

  async run () : Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }
    for await (const [msg] of this.replySock) {
      const inobj: any = decode(msg)
      if (!this.emitter.emit(inobj.cmd, inobj)) {
        this.send('unknown command')
      }
    }
  }

  async send (data: any) {
    this.replySock.send(encode(data))
  }

  async publish (data: any) {
    this.pubSock.send(encode(data))
  }

  async shutdown () : Promise<void> {
    process.exit(0)
  }
}
