#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
./flock-manager.js &
./cli.js
popd >> /dev/null
pkill -P $$

