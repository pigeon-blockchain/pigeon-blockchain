#!/bin/bash

mkdir -p /home/user
pushd /home/user
dnf install -y tar gzip gcc make nodejs
dnf clean all
npm install ipfs

cp -r /tmp/blockchain .
pushd blockchain
npm install crypto
popd
mv /tmp/run.sh .
chmod a+x run.sh
popd
