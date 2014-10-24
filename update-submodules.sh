#!/bin/sh
find . -name '*-build' -maxdepth 1 -type d -exec sh -c '(cd {} && git fetch origin master && git reset --hard origin/master)' ';'

