#!/bin/bash
set -o errexit

pushd /opt/$1
dnf install -y --setopt=install_weak_deps=False tar gzip gcc make nodejs npm git
npm install
npm run build
rm /etc/dnf/protected.d/*
npm prune --production
npm cache clean --force
dnf remove -y tar gcc make git npm shadow-utils sudo
dnf clean all
popd

