#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR > /dev/null
pushd ../flocks/examples/c > /dev/null
npm run build
popd > /dev/null
pushd ../flocks/pigeon-blockchain > /dev/null
npm run build
popd > /dev/null
pushd ../flock-manager > /dev/null
npm install
popd > /dev/null
pushd ../flock-cli > /dev/null
npm install
popd > /dev/null
popd > /dev/null

