#!/usr/bin/env node
import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'
import util = require('util')
import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')
import createLogger from 'logging'
import { execSync } from 'child_process'
import EventEmitter = require('events')
const logger = createLogger('blockapp')
const execShPromise = require('exec-sh').promise

function testString (s : string) : boolean {
  return /^[A-Za-z0-9/\-:]+$/.test(s)
}

function testImage (s : string) : boolean {
  return /^[a-z0-9_]+$/.test(s)
}

class BlockApp {
  pod: string;
  blockchain: any;
  sock: zmq.Reply;
  pubSock: zmq.Publisher;
  emitter: EventEmitter;

  constructor (
    blockchain : any,
    sock : zmq.Reply,
    pubSock : zmq.Publisher
  ) {
    this.pod = this.startup()
    logger.info('created pod ' + this.pod)
    this.blockchain = blockchain
    this.sock = sock
    this.pubSock = pubSock
    this.emitter = new EventEmitter()
    this.addEvents()
  };

  startup (): string {
    const out : any = execSync('podman pod create')
    return out.toString().trim()
  }

  addEvents (): void {
    this.emitter.on('help', () => {
      this.send('help string')
    })

    this.emitter.on('echo', (data: any) => {
      this.send(data)
    })

    this.emitter.on('test', (data: any) => {
      this.send(2 * parseInt(data.toString()))
    })

    this.emitter.on('list', async (data: any) => {
      try {
        const out : any = await execShPromise('podman images', true)
        this.send(out.stdout)
      } catch (e : any) {
        this.send(e.stderr)
      }
    })

    this.emitter.on('run', async (data: any) => {
      try {
        const s: string = data.trim()
        if (!testString(s)) {
          this.send('invalid image')
          return
        }
        const out : any =
              await execShPromise(
                util.format(
                  'podman run --pod %s %s &', this.pod, s
                ), {
                  detached: true,
                  stdio: 'ignore'
                })
        this.send(out.stdout)
      } catch (e : any) {
        this.send(e.stderr)
      }
    })

    this.emitter.on('stop', async (data: any) => {
      try {
        const s : string = data.trim()
        if (!testImage(s)) {
          this.send('invalid image')
        } else {
          const out : any =
                await execShPromise(
                  util.format(
                    'podman stop %s &', s
                  ))
          this.send(out.stdout)
        }
      } catch (e : any) {
        this.send(e.stderr)
      }
    })

    this.emitter.on('blockchain', async (data: any) => {
      const { hash: previousHash } = this.blockchain.latestBlock
      const retval = await this.blockchain.addBlock(data, previousHash)
      this.publish(retval)
      this.send(retval)
    })
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
    console.log('Shutting down ' + this.pod)
    try {
      await execShPromise('podman pod rm -f ' + this.pod, true)
    } catch (e : any) {
      logger.info(e.stderr)
    }
  }
}

async function main (): Promise<void> {
  const replySock = new zmq.Reply()
  const pubSock = new zmq.Publisher()
  await replySock.bind('tcp://127.0.0.1:3000')
  await pubSock.bind('tcp://127.0.0.1:3001')
  const bc = await new blockchain.AsyncBlockchain()
  logger.info('starting blockchain')

  const app = new BlockApp(bc, replySock, pubSock)
  process.on('SIGTERM', () => { app.shutdown() })
  process.on('SIGINT', () => { app.shutdown() })
  app.run()
}

if (typeof require !== 'undefined' && require.main === module) {
  main()
}
