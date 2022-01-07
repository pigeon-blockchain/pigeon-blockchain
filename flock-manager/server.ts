#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import util = require('util')
const execShPromise = require("exec-sh").promise;
var pod : string = "";

async function run() {
  const sock = new zmq.Reply
  await sock.bind("tcp://127.0.0.1:3000")
  try {
    const out : any = await execShPromise('podman pod create', true);
    pod = out.stdout.trim()
    console.log("created pod " + pod)
  } catch(e) {
    console.log('unable to create pod')
  }

  for await (const [msg] of sock) {
    const inobj: any = decode(msg);
    var retval;
    if (inobj.cmd == "help") {
      retval = "help string";
    } else if (inobj.cmd == "echo") {
      retval = inobj.data;
    } else if (inobj.cmd == "test") {
      retval = 2 * parseInt(decode(inobj.data).toString());
    } else if (inobj.cmd == "list") {
      try {
	const out : any = await execShPromise('podman images', true);
	retval = out.stdout;
      } catch(e) {
	retval = e.stderr;
      }
    } else if (inobj.cmd == "run") {
      // TODO: running input string through shell.
      // need to scrub string
      try {
	const out : any =
	      await execShPromise(
		util.format(
		  'podman run --pod %s %s', pod, inobj.data
		), true);
	retval = out.stdout;
      } catch(e) {
	retval = e.stderr;
      }
    } else {
      retval = "unknown command";
    }
    await sock.send(encode(retval))
  }
}

run()

async function shutdown() {
    console.log('Shutting down');
  if (pod != "") {
    try {
      const out : any = await execShPromise('podman pod rm ' + pod, true);
      process.exit(0);
    } catch(e) {
      console.log(e.stderr);
      process.exit(1);
    }
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
