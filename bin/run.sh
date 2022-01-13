#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
pushd ../src/beacon >> /dev/null
./server.js &
./cli.js <<EOF
list
EOF
popd >> /dev/null

echo "Press any key to finish"
read mainmenuinput
pkill -P $$

