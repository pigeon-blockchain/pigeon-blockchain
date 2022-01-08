#!/bin/bash

mkdir -p /opt/pigeon-blockchain
pushd /opt/pigeon-blockchain
dnf install -y tar gzip gcc make nodejs

cp -r /tmp/blockchain .
pushd blockchain
npm install
popd
dnf remove -y tar gcc make
dnf clean all
mv /tmp/run.sh .
chmod a+x run.sh
popd
