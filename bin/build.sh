#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
pushd $SCRIPT_DIR
pushd ../flocks/hello-world
npm run build
popd
pushd ../flocks/pigeon-blockchain
npm run build
popd
pushd ../flock-manager
python -mbuild
pip install dist/*.whl
popd
popd
