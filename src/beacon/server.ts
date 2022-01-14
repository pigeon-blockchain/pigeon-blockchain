#!/usr/bin/env node
import zmq = require('zeromq')
import { encode, decode } from '@msgpack/msgpack'
import util = require('util')
import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')
import createLogger from 'logging'
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

  constructor (
    pod: string,
    blockchain : any,
    sock : zmq.Reply,
    pubSock : zmq.Publisher
  ) {
    this.pod = pod
    this.blockchain = blockchain
    this.sock = sock
    this.pubSock = pubSock
  };

  static async startup (): Promise<string> {
    const out : any = await execShPromise('podman pod create', true)
    return out.stdout.trim()
  }

  async shutdown (pod: string): Promise<void> {
    execShPromise('podman pod rm -f ' + pod, true)
  }

  async run (
  ) : Promise<void> {
    for await (const [msg] of this.sock) {
      const inobj: any = decode(msg)
      let retval : any
      if (inobj.cmd === 'help') {
        retval = 'help string'
      } else if (inobj.cmd === 'echo') {
        retval = inobj.data
      } else if (inobj.cmd === 'test') {
        const data : any = decode(inobj.data)
        retval = 2 * parseInt(data.toString())
      } else if (inobj.cmd === 'list') {
        try {
          const out : any = await execShPromise('podman images', true)
          retval = out.stdout
        } catch (e : any) {
          retval = e.stderr
        }
      } else if (inobj.cmd === 'ps') {
        try {
          const out : any = await execShPromise('podman ps', true)
          retval = out.stdout
        } catch (e : any) {
          retval = e.stderr
        }
      } else if (inobj.cmd === 'run') {
        try {
          const s : string = inobj.data.trim()
          if (!testString(s)) {
            retval = 'invalid image'
          } else {
            const out : any =
                  await execShPromise(
                    util.format(
                      'podman run --pod %s %s &', this.pod, s
                    ), {
                      detached: true,
                      stdio: 'ignore'
                    })
            retval = out.stdout
          }
        } catch (e : any) {
          retval = e.stderr
        }
      } else if (inobj.cmd === 'stop') {
        try {
          const s : string = inobj.data.trim()
          if (!testImage(s)) {
            retval = 'invalid image'
          } else {
            const out : any =
                  await execShPromise(
                    util.format(
                      'podman stop %s &', s
                    ))
            retval = out.stdout
          }
        } catch (e : any) {
          retval = e.stderr
        }
      } else if (inobj.cmd === 'blockchain') {
        const { hash: previousHash } = this.blockchain.latestBlock
        retval = await this.blockchain.addBlock(inobj.data, previousHash)
        this.pubSock.send(encode(retval))
      } else {
        retval = 'unknown command'
      }
      await this.sock.send(encode(retval))
    }
  }

  async exit () : Promise<void> {
    console.log('Shutting down ' + this.pod)
    try {
      await this.shutdown(this.pod)
      process.exit(0)
    } catch (e : any) {
      logger.info(e.stderr)
      process.exit(1)
    }
  }
}

async function main (): Promise<void> {
  let pod : string
  const replySock = new zmq.Reply()
  const pubSock = new zmq.Publisher()
  await replySock.bind('tcp://127.0.0.1:3000')
  await pubSock.bind('tcp://127.0.0.1:3001')
  const bc = await new blockchain.AsyncBlockchain()
  logger.info('starting blockchain')

  try {
    pod = await BlockApp.startup()
    const app = new BlockApp(pod, bc, replySock, pubSock)
    process.on('SIGTERM', () => { app.exit() })
    process.on('SIGINT', () => { app.exit() })

    logger.info('created pod ' + pod)
    app.run()
  } catch (e) {
    logger.info('unable to create pod')
  }
}

main()
