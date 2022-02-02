#!/usr/bin/env node
import winston from 'winston'
import { FlockBase } from 'pigeon-sdk/js/flock-base'
import Algebrite from 'algebrite'

const myTransports = {
  file: new winston.transports.File({ filename: 'server.log' })
}

export class JsAlgebra extends FlockBase {
  constructor (obj: any) {
    super(obj)
    this.logger.add(myTransports.file)
  }
  async initialize (): Promise<void> {
    await super.initialize()
    this.emitter.on('test', async (inobj: any): Promise<void> => {
      const retval = 2 * parseInt(inobj.data.toString(), 10)
      await this.send(retval)
    })
    this.emitter.on('eval', async (inobj: any): Promise<void> => {
      await this.send(Algebrite.eval(inobj.data).toString())
    })
  }

  version () : string {
    return 'JsAlgebra'
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  JsAlgebra.runServer()
}
