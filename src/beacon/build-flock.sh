#!/usr/bin/env bash

set -o errexit

# Create a container
container=$(buildah from localhost/flock-base-js)
mountpoint=$(buildah mount $container)
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
name=pigeon-beacon

# Labels are part of the "buildah config" command
buildah config --label maintainer="Joseph C Wang <joe@pigeonchain.co>" $container

cp $script_dir/*.sh $mountpoint/tmp
chmod a+x $mountpoint/tmp/*.sh
mkdir -p $mountpoint/opt
cp -r $script_dir/$name $mountpoint/opt
mv $mountpoint/tmp/run.sh $mountpoint/opt/$name
chmod a+x $mountpoint/opt/$name
buildah run $container /tmp/build.sh $name

# Entrypoint, too, is a “buildah config” command
buildah config --cmd /opt/$name/run.sh $container

# Finally saves the running container to an image
buildah commit --squash --format docker $container $name:latest
