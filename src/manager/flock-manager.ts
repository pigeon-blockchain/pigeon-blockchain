#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import { createLogger, format, transports } from 'winston'
import { execSync } from 'child_process'
import util from 'util'
import { FlockBase } from 'pigeon-sdk/js/flock-base'

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

export class FlockManager extends FlockBase {
  flockInfo: any
  dataVolume: string
  constructor (
    replySockId: string
  ) {
    super(replySockId)
    this.dataVolume = 'flock-data'
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
      'port', async (inobj: any): Promise<void> => {
        const s: string = inobj.data.trim()
        const out = execSync(util.format(
          'podman port %s', s
        ))
        const portString = out.toString().trim()
        const r = portString.split(/\r?\n/).map((x: string) =>
          x.split(/\s+->\s+/))
        this.send(r)
      }
    )

    this.emitter.on(
      'run', async (inobj: any): Promise<void> => {
        try {
          const s: string = inobj.data.trim()
          if (!testString(s)) {
            this.send('invalid image')
            return
          }
          const out = execSync(util.format(
            'podman run -d -P -v %s:/data %s', this.dataVolume, s
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
          if (s === '--all') {
            this.stopAll()
            this.send('')
          } else if (!testImage(s)) {
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

  async stopAll () : Promise<void> {
    Promise.all(Object.keys(this.flockInfo).map(id => {
      logger.log('info', 'stopping %s', id)
      return execShPromise(util.format(
        'podman stop %s', id
      ), true)
    }))
  }

  async shutdown () : Promise<void> {
    logger.info('Shutting down')
    await this.stopAll()
    process.exit(0)
  }

  version () : string {
    return 'FlockManager'
  }

  static startup (argv: any) : void {
    const app = new FlockManager(argv.port.toString())
    app.run()
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  FlockManager.runServer()
}
