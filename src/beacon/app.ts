#!/usr/bin/env node
// SPDX-License-Identifier: MIT

const FlockServer = require('./server.js')
import zmq = require('zeromq')
import { execSync } from 'child_process'
import createLogger from 'logging'
import util = require('util')
import blockchain = require('vanilla-blockchain')

const logger = createLogger('blockapp')
const execShPromise = require('exec-sh').promise

function testString (s : string) : boolean {
  return /^[A-Za-z0-9/\-:]+$/.test(s)
}

function testImage (s : string) : boolean {
  return /^[a-z0-9_]+$/.test(s)
}

class BlockApp extends FlockServer {
  pod: string;
  blockchain: any;
  constructor (
    blockchain : any,
    sock : zmq.Reply,
    pubSock : zmq.Publisher
  ) {
    super(sock, pubSock)
    const out : any = execSync('podman pod create')
    this.pod = out.toString().trim()
    logger.info('created pod ' + this.pod)
    this.blockchain = blockchain
    this.addEvents()
  }

  addEvents (): void {
    this.emitter.on('help', async (): Promise<void> => {
      this.send('help string')
    })

    this.emitter.on('echo', async (data: any): Promise<void> => {
      this.send(data)
    })

    this.emitter.on(
      'test', async (data: any): Promise<void> => {
        this.send(2 * parseInt(data.toString()))
      })

    this.emitter.on(
      'list', async (data: any): Promise<void> => {
        try {
          const out = await execShPromise('podman images', true)
          this.send(out.stdout)
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'ps', async (data: any): Promise<void> => {
        try {
          const out = await execShPromise('podman ps', true)
          this.send(out.stdout)
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'run', async (data: any): Promise<void> => {
        try {
          const s: string = data.trim()
          if (!testString(s)) {
            this.send('invalid image')
            return
          }
          const out =
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

    this.emitter.on(
      'stop', async (data: any) : Promise<void> => {
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

    this.emitter.on(
      'blockchain', async (data: any) : Promise<void> => {
        const { hash: previousHash } = this.blockchain.latestBlock
        const retval = await this.blockchain.addBlock(data, previousHash)
        this.publish(retval)
        this.send(retval)
      })
  }

  async shutdown () : Promise<void> {
    logger.info('Shutting down ' + this.pod)
    try {
      await execShPromise('podman pod rm -f ' + this.pod, true)
      process.exit(0)
    } catch (e : any) {
      logger.info(e.stderr)
      process.exit(1)
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
