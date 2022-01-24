#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createLogger, format, transports } from 'winston'
import { execSync } from 'child_process'
import util from 'util'
import FlockServer from 'pigeon-sdk/js/flock-server.js'

const myTransports = {
  file: new transports.File({ filename: 'server.log' })
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple()
  ),
  transports: [
    myTransports.file
  ]
})

const execShPromise = require('exec-sh').promise

function testString (s : string) : boolean {
  return /^[A-Za-z0-9/\-:]+$/.test(s)
}

function testImage (s : string) : boolean {
  return /^[a-z0-9_]+$/.test(s)
}

/** Class implementing FlockManager
 * @extends FlockServer
 */

export class FlockManager extends FlockServer {
  flockInfo: any
  constructor (
    replySockId: string
  ) {
    super(replySockId)

    this.flockInfo = {}
    process.on('SIGTERM', () => { this.shutdown() })
    process.on('SIGINT', () => { this.shutdown() })
  }

  async initialize (): Promise<void> {
    logger.log('info', 'server initializing')
    await super.initialize()
    this.emitter.on('help', async (): Promise<void> => {
      this.send('help string')
    })

    this.emitter.on('echo', async (inobj: any): Promise<void> => {
      this.send(inobj.data)
    })

    this.emitter.on(
      'test', async (inobj: any): Promise<void> => {
        this.send(2 * parseInt(inobj.data.toString()))
      })

    this.emitter.on(
      'list', async (inobj: any): Promise<void> => {
        try {
          const out = await execShPromise('podman images', true)
          this.send(out.stdout)
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'ps', async (inobj: any): Promise<void> => {
        try {
          const out = await execShPromise('podman ps', true)
          this.send(out.stdout)
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'run', async (inobj: any): Promise<void> => {
        try {
          const s: string = inobj.data.trim()
          if (!testString(s)) {
            this.send('invalid image')
            return
          }
          const out = execSync(util.format(
            'podman run -d -P %s', s
          ))
          const flockId = out.toString().trim()
          this.send(flockId)
          logger.log('info', 'running %s', flockId)
          this.flockInfo[flockId] = {}
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'stop', async (inobj: any) : Promise<void> => {
        try {
          const s : string = inobj.data.trim()
          if (!testImage(s)) {
            this.send('invalid image')
          } else {
            const out =
                  await execShPromise(
                    util.format(
                      'podman stop %s', s
                    ))
            this.send(out.stdout)
          }
        } catch (e : any) {
          this.send(e.stderr)
        }
      })

    this.emitter.on(
      'debug', async (inobj: any) : Promise<void> => {
        if (inobj.data === 'on') {
          myTransports.file.level = 'debug'
          this.send('debug on')
        } else if (inobj.data === 'off') {
          myTransports.file.level = 'info'
          this.send('debug off')
        }
      })
  }

  async shutdown () : Promise<void> {
    logger.info('Shutting down')
    Promise.all(Object.keys(this.flockInfo).map(id => {
      logger.log('info', 'stopping %s', id)
      return execShPromise(util.format(
        'podman stop %s', id
      ), true)
    }))
    process.exit(0)
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  logger.info('starting FlockManager')
  const app = new FlockManager('tcp://127.0.0.1:3000')
  app.run()
}
