#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR > /dev/null
pushd ../src/flocks/examples/c > /dev/null
npm run build
popd > /dev/null
pushd ../src/flocks/examples/nodejs > /dev/null
npm install
npm run build
popd > /dev/null
pushd ../src/beacon > /dev/null
npm install
npm run build
popd > /dev/null
popd > /dev/null

