#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Milestone Title (optional)
if [ -z $3 ]; then
  curl -s -H "Authorization: token $1" https://api.github.com/orgs/$2/issues?filter=all | json -a title url
else
  curl -s -H "Authorization: token $1" https://api.github.com/orgs/$2/issues?filter=all | json -a title url -c "milestone && milestone.title=='$3'"
fi

