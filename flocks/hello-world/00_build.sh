#!/bin/bash
dnf install -y tar gzip gcc make
dnf clean all
tar xvzf /tmp/hello-2.10.tar.gz -C /opt

mkdir -p /home/user
pushd /home/user
dnf install -y tar gzip gcc make nodejs
dnf clean all

pushd /opt/hello-2.10 > /dev/null
./configure
make
make install
hello -v
popd

mv /tmp/run.sh .
chmod a+x run.sh
popd
