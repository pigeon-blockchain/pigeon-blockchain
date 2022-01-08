#!/bin/bash
pushd /opt/example-nodejs-flock
dnf install -y tar gzip gcc make nodejs ipfs
npm install
dnf remove -y tar gcc make
dnf clean all
popd

