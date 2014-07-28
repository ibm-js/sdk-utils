#!/bin/sh
# $1 = API Token
# $2 = User Name
# $3 = Repo Name
curl -H "Authorization: token $1" -d "{\"name\":\"1-low\",\"color\":\"bfe5bf\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"2-medium\",\"color\":\"fef2c0\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"3-high\",\"color\":\"fad8c7\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"4-blocker\",\"color\":\"f7c6c7\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"feature\",\"color\":\"fbca04\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"task\",\"color\":\"009800\"}" https://api.github.com/repos/$2/$3/labels
curl -H "Authorization: token $1" -d "{\"name\":\"postponed\",\"color\":\"#5f5f5f\"}" https://api.github.com/repos/$2/$3/labels

