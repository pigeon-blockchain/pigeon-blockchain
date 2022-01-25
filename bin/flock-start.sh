#!/bin/bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR
npx flock-manager tcp://127.0.0.1:3000 &
npx flock-cli tcp://127.0.0.1:3000
pkill -P $$
