#!/usr/bin/env node
import zmq = require("zeromq")
import { encode, decode } from "@msgpack/msgpack";
import util = require('util')
const execShPromise = require("exec-sh").promise;

function test_string(s : string) : boolean {
  return /^[A-Za-z0-9\/\-:]+$/.test(s);
}

function test_image(s : string) : boolean {
  return /^[a-z0-9_]+$/.test(s);
}

async function startup(): Promise<string> {
  const out : any = await execShPromise('podman pod create', true);
  return out.stdout.trim()
}

async function shutdown(pod: string): Promise<void> {
  execShPromise('podman pod rm -f ' + pod, true);
}

async function run(pod: string) : Promise<void> {
  const sock = new zmq.Reply
  await sock.bind("tcp://127.0.0.1:3000")

  for await (const [msg] of sock) {
    const inobj: any = decode(msg);
    var retval : any;
    if (inobj.cmd == "help") {
      retval = "help string";
    } else if (inobj.cmd == "echo") {
      retval = inobj.data;
    } else if (inobj.cmd == "test") {
      const data : any = decode(inobj.data)
      retval = 2 * parseInt(data.toString());
    } else if (inobj.cmd == "list") {
      try {
	const out : any = await execShPromise('podman images', true);
	retval = out.stdout;
      } catch(e : any) {
	retval = e.stderr;
      }
    } else if (inobj.cmd == "ps") {
      try {
	const out : any = await execShPromise('podman ps', true);
	retval = out.stdout;
      } catch(e : any) {
	retval = e.stderr;
      }
    } else if (inobj.cmd == "run") {
      try {
	const s : string = inobj.data.trim();
	if (!test_string(s)) {
	  retval = "invalid image"
	} else {
	  const out : any =
		await execShPromise(
		  util.format(
		  'podman run --pod %s %s &', pod, s
		  ), {
		    detached: true,
		    stdio: 'ignore'
		  });
	  retval = out.stdout;
	}
      } catch(e : any) {
	retval = e.stderr;
      }
    } else if (inobj.cmd == "stop") {
      try {
	const s : string = inobj.data.trim();
	if (!test_image(s)) {
	  retval = "invalid image"
	} else {
	  const out : any =
		await execShPromise(
		  util.format(
		  'podman stop %s &', s
		  ));
	  retval = out.stdout;
	}
      } catch(e : any) {
	retval = e.stderr;
      }
    } else {
      retval = "unknown command";
    }
    await sock.send(encode(retval))
  }
}

async function main(): Promise<void> {
  let pod : string;
  async function exit() : Promise<void> {
    console.log('Shutting down');
    try {
      await shutdown(pod);
      process.exit(0);
    } catch(e : any) {
      console.log(e.stderr);
      process.exit(1);
    }
  }

  process.on('SIGTERM', exit);
  process.on('SIGINT', exit);

  try {
    pod = await startup();
    console.log("created pod " + pod)
    run(pod)
  } catch(e) {
    console.log('unable to create pod')
  }
}

main();

