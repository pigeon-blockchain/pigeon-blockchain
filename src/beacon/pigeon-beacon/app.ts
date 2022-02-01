#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')
import { FlockBase } from 'pigeon-sdk/js/flock-base'

/** Class implementing Blockchain server
 * @extends FlockServer
 */

export class BlockApp extends FlockBase {
  blockchain: any;
  debug: boolean;
  constructor (
    obj: any
  ) {
    super(obj)
    this.blockchain = {}
    this.debug = false
  }

  async getBlockchain (name: string) {
    if (this.blockchain[name] === undefined) {
      this.blockchain[name] =
        await new blockchain.AsyncBlockchain({ filename: name })
    }
    return this.blockchain[name]
  }

  async initialize (): Promise<void> {
    await super.initialize()
    this.blockchain.default = await new blockchain.AsyncBlockchain()
    this.emitter.on('help', async (): Promise<void> => {
      this.send('help string')
    })

    this.emitter.on('echo', async (inobj: any): Promise<void> => {
      this.send(inobj.data)
    })

    this.emitter.on(
      'block', async (inobj: any) : Promise<void> => {
        let name = inobj.subcmd
        if (name === '' || name === undefined) {
          name = 'root'
        }
        const blockchain = await this.getBlockchain(name)
        const { hash: previousHash } = blockchain.latestBlock
        const retval = await blockchain.addBlock(
          inobj.data, previousHash
        )
        this.send(retval)
        this.publish(name, retval)
      })

    this.emitter.on(
      'debug', async (inobj: any) : Promise<void> => {
        if (inobj.data === 'on') {
          this.debug = true
          this.send('debug on')
        } else if (inobj.data === 'off') {
          this.debug = false
          this.send('debug off')
        }
      })
  }

  version () : string {
    return 'Beacon'
  }

  static startup (argv: any) : void {
    const app = new BlockApp(argv)
    app.run()
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  BlockApp.runServer()
}
