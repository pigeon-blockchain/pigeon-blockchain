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

# Grab the source code outside of the container
curl -sSL http://ftp.gnu.org/gnu/hello/hello-2.10.tar.gz -o $mountpoint/tmp/hello-2.10.tar.gz

buildah run $container /tmp/build.sh

# Entrypoint, too, is a “buildah config” command
buildah config --entrypoint /home/user/run.sh $container

# Finally saves the running container to an image
buildah commit --squash --format docker $container hello:latest
