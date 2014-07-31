#!/bin/sh
# $1 = User Name
# $2 = Repo Name
# $3 = version

# Clone repository if it doesn't already exist.
# Otherwise just update it.
if [ ! -d $2 ]
then
	git clone git@github.com:$1/$2.git
	cd $2
else
	cd $2
	git checkout $3
	git pull
fi

git checkout gh-pages
mkdir -p docs/$3

# Get doc files from master branch into a clean directory (without .git* metadata)
rm -rf docsco
mkdir docsco
git --work-tree=docsco checkout $3 -- docs

# Convert ibm-js links from .md -> .html
# Ex: [...](./Container.md), or [...](/decor/docs/master/Stateful.md)
# However, don't convert absolute URLs that are supposed to go to .md files, like
# https://github.com/SitePen/dstore/blob/master/README.md
find docsco -name "*.md" -exec sed -i.bak \
	-e 's/\(http.*\)\.md/\1.XXX/g' \
	-e 's/\.md/.html/g' \
	-e 's/.XXX/.md/g' \
	'{}' \;
find docsco -name "*.bak" -type f | xargs /bin/rm -f


# Check in updated doc files into gh-pages branch
cp -R docsco/docs/* docs/$3
git add --all docs
git commit -m "update doc"

git push origin gh-pages
