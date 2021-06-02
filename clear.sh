#!/bin/bash

watchman watch-del-all
watchman watch .
rm -rf ./node_modules/
npm cache verify
npm install
rm -rf /tmp/metro-*
npm start --reset-cache
