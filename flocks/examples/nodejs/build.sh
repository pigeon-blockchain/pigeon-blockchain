#!/bin/bash
set -o errexit

pushd /opt/example-nodejs-flock
dnf install -y tar gzip gcc make nodejs npm
npm install
npm run build
dnf remove -y tar gcc make npm
dnf clean all
popd

