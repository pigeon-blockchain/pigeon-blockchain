#!/usr/bin/env node
const zmq = require("zeromq")
const readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function run() {
    const sock = new zmq.Request
    sock.connect("tcp://127.0.0.1:3000")
    console.log("Producer bound to port 3000")
    const asyncReadline = function() {
	rl.question("Command: ", async function(answer) {
	    sock.send(answer)
	    const [result] = await sock.receive()
	    console.log(result.toString());
	    asyncReadline();
	});
    }
    asyncReadline();
}

run()
