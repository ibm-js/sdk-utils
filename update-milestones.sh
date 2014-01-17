#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Repo Name
# $4 = Milestone Title
# $5 = Milestone Date (yyyy-mm-dd)
number=`curl -s -H "Authorization: token $1" https://api.github.com/repos/$2/$3/milestones | json -a number -c "title==$4" -C`
curl -H "Authorization: token $1" -d "{\"due_on\":\"$5T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones/$number

