#!/bin/sh
# $1 = User Name
# $2 = Repo Name
# $3 = version
git clone git@github.com:$1/$2.git
cd $2
git checkout gh-pages
git checkout $3 -- docs
cd docs
mkdir $3
# .md -> .html
find . -name "*.md" -exec sed -i.bak "s/.md/.html/g" '{}' \;
rm *.bak
cp * $3
git add $3
git commit -m "update doc"
git push origin gh-pages
