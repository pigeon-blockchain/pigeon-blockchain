var assert = require('assert');
const Cli = require('../cli')
const FlockManager = require('../app')

describe('Manager', function() {
  let cli, app;
  before(async function() {
    app = new FlockManager.FlockManager('tcp://127.0.0.1:3000')
    cli = new Cli.Cli('tcp://127.0.0.1:3000')
    app.run()
  })
  after(function() {
    app.shutdown()
  })

  describe('hello world', function() {
    it('return hello world', async function() {
      const r = await cli.send('echo hello world')
      assert.equal(r, 'hello world');
    });
  });
});
