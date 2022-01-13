#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR > /dev/null
pushd ../flocks/examples/c > /dev/null
npm run build
popd > /dev/null
pushd ../flocks/examples/nodejs > /dev/null
npm run build
popd > /dev/null
pushd ../beacon > /dev/null
npm install
popd > /dev/null
pushd ../flock-cli > /dev/null
npm install
popd > /dev/null
popd > /dev/null

