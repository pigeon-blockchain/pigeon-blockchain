#!/bin/bash

pushd /opt/pigeon-blockchain
dnf install -y tar gzip gcc make nodejs file gcc-c++ zeromq-devel zeromq
npm install
npm run build

dnf autoremove -y tar gcc make file gcc-c++
dnf remove -y zeromq-devel
dnf clean all
mv /tmp/run.sh .
chmod a+x run.sh
popd
