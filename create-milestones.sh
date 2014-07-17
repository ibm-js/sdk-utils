#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Repo Name
curl -H "Authorization: token $1" -d "{\"title\":\"0.2.0-dev\",\"due_on\":\"2014-08-01T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.0.0\",\"due_on\":\"2015-03-30T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.0.0-alpha\",\"due_on\":\"2015-01-15T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.0.0-beta\",\"due_on\":\"2015-02-12T23:39:01Z\"}" https://api.github.com/repos/$2/$3/milestones
curl -H "Authorization: token $1" -d "{\"title\":\"1.1.0\"}" https://api.github.com/repos/$2/$3/milestones

