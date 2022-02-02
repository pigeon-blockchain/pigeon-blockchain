#!/bin/bash
set -o errexit

pushd /opt/$1
npm install
npm run build
rm /etc/dnf/protected.d/*
npm prune --production
npm cache clean --force
dnf remove -y tar gcc make git npm shadow-utils sudo
dnf clean all
popd

