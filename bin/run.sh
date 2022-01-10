#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
pushd ../flock-manager >> /dev/null
./server.js &
popd >> /dev/null
pushd ../flock-cli >> /dev/null
./cli.js <<EOF
list
EOF
popd >> /dev/null
popd >> /dev/null

echo "Press any key to finish"
read mainmenuinput
pkill -P $$

