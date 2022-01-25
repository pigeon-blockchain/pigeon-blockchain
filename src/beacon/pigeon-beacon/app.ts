#!/usr/bin/env node
// SPDX-License-Identifier: MIT

import 'regenerator-runtime/runtime'
import blockchain = require('vanilla-blockchain')
import FlockServer from 'pigeon-sdk/js/flock-server'

/** Class implementing Blockchain server
 * @extends FlockServer
 */

export class BlockApp extends FlockServer {
  blockchain: any;
  debug: boolean;
  constructor (
    replySockId: string
  ) {
    super(replySockId)
    this.blockchain = {}
    this.debug = false
  }

  async getBlockchain (name: string) {
    if (name === '' || name === undefined) {
      name = 'root'
    }
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
        const blockchain = await this.getBlockchain(inobj.subcmd)
        const { hash: previousHash } = blockchain.latestBlock
        const retval = await blockchain.addBlock(
          inobj.data, previousHash
        )
        this.send(retval)
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

  static startup (argv: any) : void {
    const app = new BlockApp(argv.port.toString())
    app.run()
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  BlockApp.runServer()
}
