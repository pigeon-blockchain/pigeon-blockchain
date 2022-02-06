#!/bin/bash
set -o errexit

pushd /opt/$1
mkdir -p /data/$1/store
npm install
chmod a+x *.js *.sh
rm -rf store
ln -s ../../data/$1/store store
rm /etc/dnf/protected.d/*
npm prune --production
npm cache clean --force
dnf autoremove -y tar gcc make git npm shadow-utils sudo
dnf clean all
popd

