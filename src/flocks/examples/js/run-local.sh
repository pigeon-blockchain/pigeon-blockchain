#!/bin/bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
exec $script_dir/server.js --conport tcp://0.0.0.0:3000 --beaconprefix tcp://host.containers.internal



