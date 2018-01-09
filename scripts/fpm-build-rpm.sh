#!/bin/bash

VERSION=`git describe --tags`
ITTERATION=1
ARCH=noarch

fpm -s dir \
    -t rpm \
    -n "kazoo-ui" \
    -v $VERSION \
    --iteration $ITTERATION \
    -a $ARCH \
    --prefix /var/www/html/kazoo-ui \
    \
    --config-files /var/www/html/kazoo-ui/config \
    \
    $@ .
