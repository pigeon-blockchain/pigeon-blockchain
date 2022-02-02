#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
mkdir -p /data/pigeon-beacon/store
exec $script_dir/app.js --conport tcp://0.0.0.0:3000 --pubport tcp://0.0.0.0:3001 --beaconprefix tcp://host.containers.internal
