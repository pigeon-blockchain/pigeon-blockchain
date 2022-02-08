#!/bin/bash
set -o errexit

pushd /opt/$1
mkdir -p /data/$1/store
rm -rf store
ln -s ../../data/$1/store store
popd

