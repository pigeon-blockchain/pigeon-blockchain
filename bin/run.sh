#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR
pushd ../flock-manager/bin
python ./flock-manager.py >& $SCRIPT_DIR/log.flock-manager &
popd
popd

echo "Press any key to finish"
read mainmenuinput
trap 'kill $(jobs -p)' EXIT
