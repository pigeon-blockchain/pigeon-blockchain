#!/bin/bash
CMD=${1:-podman}
$CMD ps -a -q | xargs -r $CMD rm --force
$CMD images | grep "^<none>" | awk '{print $3}' | xargs -r $CMD rmi --force
exit 0
