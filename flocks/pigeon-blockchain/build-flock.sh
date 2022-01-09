#!/usr/bin/env bash

set -o errexit
set -v

# Create a container
container=$(buildah from fedora:35)
mountpoint=$(buildah mount $container)
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Labels are part of the "buildah config" command
buildah config --label maintainer="Joseph C Wang <joe@pigeonchain.co>" $container

cp $script_dir/*.sh $mountpoint/tmp
chmod a+x $mountpoint/tmp/*.sh
mkdir -p $mountpoint/opt
cp -r $script_dir/blockchain $mountpoint/opt/pigeon-blockchain
buildah run $container /tmp/build.sh
buildah config --cmd /opt/pigeon-blockchain/run.sh $container
buildah commit --squash --format docker $container pigeon-blockchain:latest
