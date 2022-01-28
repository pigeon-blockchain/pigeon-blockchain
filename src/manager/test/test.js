"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const flock_cli_1 = require("pigeon-sdk/js/flock-cli");
const flock_manager_1 = require("../flock-manager");
let app;
let cli;
describe('Manager', function () {
    before(async function () {
        app = new flock_manager_1.FlockManager({
            conport: 'tcp://127.0.0.1:3000'
        });
        cli = new flock_cli_1.FlockCli();
        app.run();
        await cli.portConnect('default', 'tcp://127.0.0.1:3000');
    });
    after(async function () {
        app.stopAll();
    });
    describe('echo', function () {
        let beacon;
        it('echo', async function () {
            const r = await cli.send('echo hello world');
            assert_1.default.equal(r, 'hello world');
        });
        it('list', async function () {
            const r = await cli.send('list');
            assert_1.default.ok(r.includes('localhost/pigeon-beacon'));
        });
        it('run', async function () {
            beacon = await cli.send('run localhost/pigeon-beacon');
            assert_1.default.ok(beacon.match(/[0-9a-f]+/));
        });
        it('ps', async function () {
            const r = await cli.send('ps');
            assert_1.default.ok(r.includes('localhost/pigeon-beacon'));
        });
        let port;
        it('port', async () => {
            const r = await cli.send('port ' + beacon);
            assert_1.default.equal(r[0][0], '3000/tcp');
            assert_1.default.match(r[0][1], /0\.0\.0\.0:[0-9]+/);
            port = r[0][1].split(':')[1];
        });
        it('.port-connect', async () => {
            await cli.send('.port-connect blockchain ' + port);
        });
        it('.port-connect', async () => {
            const r = await cli.send('.port-list');
            assert_1.default.equal(r.blockchain, 'tcp://127.0.0.1:' + port.toString());
        });
        it('stop --all', async function () {
            await cli.send('.port tcp://127.0.0.1:3000');
            await cli.send('stop --all');
        });
        it('version', async () => {
            const r = await cli.send('version');
            assert_1.default.equal(r, 'FlockManager');
        });
    });
});
