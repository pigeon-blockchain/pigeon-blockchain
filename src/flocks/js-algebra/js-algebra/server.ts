#!/usr/bin/env node
import { FlockBase } from 'pigeon-sdk/js/flock-base'
import Algebrite from 'algebrite'

export class JsAlgebra extends FlockBase {
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
  ExampleJsFlock.runServer()
}
