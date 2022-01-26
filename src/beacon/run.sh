#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
mkdir -p /data/pigeon-beacon/store
./app.js tcp://0.0.0.0:3000 >> server.log
popd >> /dev/null
