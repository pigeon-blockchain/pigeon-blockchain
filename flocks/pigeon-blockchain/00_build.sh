#!/bin/bash

mkdir -p /home/user
pushd /home/user
dnf install -y tar gzip gcc make nodejs
dnf clean all
tar xvzf /tmp/hello-2.10.tar.gz -C /opt

npm install ipfs
popd
