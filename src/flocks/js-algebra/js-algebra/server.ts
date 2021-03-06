#!/usr/bin/env node
import winston from 'winston'
import { FlockBase } from 'pigeon-sdk/js/flock-base'
import Algebrite from 'algebrite'

const myTransports = {
  file: new winston.transports.File({ filename: 'server.log' })
}

function isObject(a: any) {
  return (!!a) && (a.constructor === Object);
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
    this.emitter.on(
      'subscribe',
      async (inobj: any): Promise<void> => {
        this.beaconSubscribe(inobj.data)
        this.send(`subscribed to ${inobj.data}`)
      })
    this.emitter.on(
      'unsubscribe',
      async (inobj: any): Promise<void> => {
        this.beaconUnsubscribe(inobj.data)
        this.send(`unsubscribed to ${inobj.data}`)
      })

  }
  
  async beaconProcessTxn (filter: string, inobj: any) : Promise<boolean> {
    const data = inobj.data;
    if (!isObject(data)) {
      return false
    }
    if (data.cmd === "js-algebra.eval") {
      const result = await this.beaconSend({
        cmd: 'block',
        subcmd: filter,
        data: {
          eval: data.eval,
          result: Algebrite.eval(data.eval).toString()
        }
      })
      this.logger.log('info', result)
    }
    return true
  }

  
  version () : string {
    return 'JsAlgebra'
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  JsAlgebra.runServer()
}
