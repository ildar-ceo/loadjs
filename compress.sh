#!/bin/bash

SCRIPT=$(readlink -f $0)
SCRIPT_PATH=`dirname $SCRIPT`

java -jar ${SCRIPT_PATH}/bin/yuicompressor-2.4.8.jar --type js load.js -o load.min.js --charset utf-8
java -jar ${SCRIPT_PATH}/bin/yuicompressor-2.4.8.jar --type js angular.load.js -o angular.load.min.js --charset utf-8
