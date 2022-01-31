#!/bin/bash
set -o errexit

pushd /opt/$1
dnf install -y --setopt=install_weak_deps=False tar gzip gcc make nodejs npm
npm install
npm run build
dnf remove -y tar gcc make
dnf clean all
popd

