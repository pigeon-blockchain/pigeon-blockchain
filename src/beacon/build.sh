#!/bin/bash
set -o errexit

pushd /opt/$1
mkdir -p /data/pigeon-beacon/store
dnf install -y --setopt=install_weak_deps=False tar gzip gcc make nodejs npm git
npm install
rm -rf store
ln -s ../../data/pigeon-beacon/store store
npm prune --production
dnf autoremove -y tar gcc make git npm
dnf clean all
popd

