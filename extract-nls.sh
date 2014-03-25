#!/bin/sh
find . -type d -name "nls" -not \( -path "*/node_modules/*" -o -path "*/cldr/*" -o -path "*/tests/*" \) -print0 |  xargs -0 -i"{}" find "{}" -maxdepth 1 -name "*.js" -print0 | tar --null -T- -zcvf nls.tar.gz
 #--no-wildcards-match-slash