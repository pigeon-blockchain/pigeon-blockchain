#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR
pushd ../flock-manager
./server.js &
popd
pushd ../flock-cli
./cli.js &
popd
popd

echo "Press any key to finish"
read mainmenuinput
pkill -P $$

