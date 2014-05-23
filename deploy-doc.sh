#!/bin/sh
# $1 = User Name
# $2 = Repo Name
# $3 = version
git clone git@github.com:$1/$2.git
cd $2
git checkout gh-pages
mkdir -p docs
cd docs
mkdir $3
cd ..
mkdir docsco
git --work-tree=docsco checkout $3 -- docs
cd docsco
# .md -> .html
find . -name "*.md" -exec sed -i.bak "s/.md/.html/g" '{}' \;
find . -name "*.bak" -type f | xargs /bin/rm -f
cp -R docs/* ../docs/$3
cd ..
rm -rf docsco
git add --all .
git commit -m "update doc"
git push origin gh-pages
