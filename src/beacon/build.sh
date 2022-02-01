#!/bin/bash
set -o errexit

pushd /opt/$1
mkdir -p /data/pigeon-beacon/store
npm install
rm -rf store
ln -s ../../data/pigeon-beacon/store store
rm /etc/dnf/protected.d/*
npm prune --production
npm cache clean --force
dnf autoremove -y tar gcc make git npm shadow-utils sudo
dnf clean all
popd

