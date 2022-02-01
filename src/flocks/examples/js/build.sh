#!/bin/bash
set -o errexit

pushd /opt/$1
npm install
npm run build
dnf remove -y tar gcc make npm git
dnf clean all
popd

