#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Repo Name
curl -H "Authorization: token $1" -d "{\"title\":\"1.0\",\"due_on\":\"2014-07-24T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.0alpha\",\"due_on\":\"2014-03-27T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.0beta\",\"due_on\":\"2014-06-12T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.1\"}" https://api.github.com/repos/$2/$3/milestones

