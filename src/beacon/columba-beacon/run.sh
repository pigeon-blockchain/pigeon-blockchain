#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR >> /dev/null
./app.js --conport tcp://127.0.0.1:3000 --pubport tcp://127.0.0.1:3001 &
npx flock-cli tcp://127.0.0.1:3000
popd >> /dev/null
pkill -P $$

