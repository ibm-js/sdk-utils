#!/bin/sh
# $1 = User Name
# $2 = Repo Name
git clone git@github.com:$1/$2.git
cd $2
exists=`git ls-remote origin refs/heads/gh-pages`
if [ -n "$exists" ]; then
    echo "gh-pages exists"
    git checkout gh-pages
else
    echo "create gh-pages branch"
    git checkout --orphan gh-pages
    git rm -rf .
fi
dir=$(dirname "$0")
echo "getting the template from $dir"
dir=..
cp -R $dir/gh-template/* .
sed -i.bak s/RepoName/$2/g index.html
sed -i.bak s/RepoName/$2/g _config.yml
cd _layouts
sed -i.bak s/RepoName/$2/g doc.html
rm *.bak
cd ..
git add css
git add _layouts
git add fonts
git add js
git add ibmjs.png
git add index.html
git add _config.yml
git commit -m "update jekyll structure"
git push origin gh-pages

