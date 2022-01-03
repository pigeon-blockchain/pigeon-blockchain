#!/usr/bin/env bash

set -o errexit
set -v

# Create a container
container=$(buildah from fedora:35)

# Labels are part of the "buildah config" command
buildah config --label maintainer="Joseph C Wang <joe@pigeonchain.co>" $container

# Grab the source code outside of the container
if [ ! -e hello-2.10.tar.gz ] ; then
curl -sSL http://ftpmirror.gnu.org/hello/hello-2.10.tar.gz -o hello-2.10.tar.gz
fi

buildah copy $container hello-2.10.tar.gz /tmp/hello-2.10.tar.gz

buildah run $container dnf install -y tar gzip gcc make
buildah run $container dnf clean all
buildah run $container tar xvzf /tmp/hello-2.10.tar.gz -C /opt

# Workingdir is also a "buildah config" command
buildah config --workingdir /opt/hello-2.10 $container

buildah run $container ./configure
buildah run $container make
buildah run $container make install
buildah run $container hello -v

buildah run $container dnf install -y dnf-plugins-core distribution-gpg-keys
buildah run $container dnf copr enable taw/ipfs -y
buildah run $container dnf install -y go-ipfs --refresh

# Entrypoint, too, is a “buildah config” command
buildah config --entrypoint /usr/local/bin/hello $container

# Finally saves the running container to an image
buildah commit --format docker $container hello:latest
