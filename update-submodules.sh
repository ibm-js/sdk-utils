#!/bin/sh
find . -maxdepth 1 -type d -exec sh -c '(cd {} && git pull)' ';'

