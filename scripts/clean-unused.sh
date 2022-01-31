#!/bin/bash
CMD=${1:-podman}
$CMD images | grep "^<none>" | awk '{print $3}' | xargs -r $CMD rmi
$CMD ps -a -q | xargs -r $CMD rm 
exit 0
