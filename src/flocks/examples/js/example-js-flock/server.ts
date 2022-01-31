#!/usr/bin/env node
import { FlockBase } from 'pigeon-sdk/js/flock-base'

export class ExampleJsFlock extends FlockBase {
  async initialize (): Promise<void> {
    await super.initialize()
    this.emitter.on('test', async (inobj: any): Promise<void> => {
      const retval = 2 * parseInt(inobj.data.toString(), 10)
      await this.send(retval)
    })
  }

  version () : string {
    return 'ExampleJsFlock'
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  ExampleJsFlock.runServer()
}
