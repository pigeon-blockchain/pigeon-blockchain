#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR/../src/beacon >> /dev/null
./server.js >> server.log &
./cli.js
popd >> /dev/null
pkill -P $$

