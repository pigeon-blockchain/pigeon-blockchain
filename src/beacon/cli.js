#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("zeromq");
const readline = require("readline");
const msgpack_1 = require("@msgpack/msgpack");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function my_split(string, delimiter, n) {
    var parts = string.split(delimiter);
    return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)]);
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const sock = new zmq.Request;
        sock.connect("tcp://127.0.0.1:3000");
        console.log("Producer bound to port 3000");
        const asyncReadline = function () {
            rl.question("Command: ", function (answer) {
                return __awaiter(this, void 0, void 0, function* () {
                    const [cmd, data] = my_split(answer, " ", 2);
                    sock.send((0, msgpack_1.encode)({ "cmd": cmd, "data": data }));
                    const [result] = yield sock.receive();
                    console.log((0, msgpack_1.decode)(result));
                    asyncReadline();
                });
            });
        };
        asyncReadline();
    });
}
run();
