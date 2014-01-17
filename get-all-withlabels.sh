#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Label
# $4 = Milestone Title (optional)
if [ -z $4 ]; then
  curl -s -H "Authorization: token $1" https://api.github.com/orgs/$2/issues?filter=all | json -a title -c "(function isLabel(){for(var i = 0; i < labels.length; i++){if(labels[i].name=='$3')return true};return false})()"
else
  curl -s -H "Authorization: token $1" https://api.github.com/orgs/$2/issues?filter=all | json -a title -c "(function isLabel(){for(var i = 0; i < labels.length; i++){if(labels[i].name=='$3')return true};return false})() milestone && milestone.title=='$4'"
fi

