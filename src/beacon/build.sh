#!/bin/bash
set -o errexit

pushd /opt/$1
mkdir -p /data/pigeon-beacon/store
dnf install -y --setopt=install_weak_deps=False tar gzip gcc make nodejs npm git
npm install
rm -rf store
ln -s ../../data/pigeon-beacon/store store
dnf remove -y tar gcc make git
dnf clean all
popd

