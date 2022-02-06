#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $script_dir
./app.js --conport tcp://127.0.0.1:3000 --pubport tcp://127.0.0.1:3001 &
npx flock-cli tcp://127.0.0.1:3000
pkill -P $$



