#!/usr/bin/env bash
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
name=example-js-flock
maintainer="Joseph C Wang <joequant@gmail.com>"
base=localhost/flock-base-js

. ../../columba-sdk/js/build-flock-body.sh
