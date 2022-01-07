#!/bin/bash
dnf install -y tar gzip gcc make
dnf clean all
tar xvzf /tmp/hello-2.10.tar.gz -C /opt

mkdir -p /home/user
pushd /home/user
dnf install -y tar gzip gcc make

pushd /opt/hello-2.10 > /dev/null
./configure
make
make install
hello -v
popd
rm -rf /opt/hello-2.10
dnf remove -y tar gcc make
dnf clean all

mv /tmp/run.sh .
chmod a+x run.sh
popd
