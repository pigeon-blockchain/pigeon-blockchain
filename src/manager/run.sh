#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
./flock-manager.js tcp://127.0.0.1:3000 &
./cli.js tcp://127.0.0.1:3000
popd >> /dev/null
pkill -P $$

