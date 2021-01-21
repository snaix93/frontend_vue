#!/bin/bash

#
# This script will be executed after each push to the bitbucket repository
# The script runs as cgi. The whole response of the script is stored at bitbucket.
#

if [ -z $BRANCH ]; then
  echo 'env $BRANCH not set. Exit!'
  exit 1
fi

cd /var/www/frontend_v2

if [ -z $1 ];then
  # $1 not set, script was triggered by http request
  echo "Content-type: text/html"
  echo ""
  echo "Executing $0 in the backgound"
  nohup /bin/bash $0 background > /dev/null 2>&1 < /dev/null &
  exit 0
fi

# Stop if npm is already running
pgrep -f "node /var/www/frontend_v2/" >/dev/null && exit 1

SLACK=/tmp/frontend_v2-deployment-slack.txt
NPMLOG=dist/deployment-npm.log

if git status|grep -q "On branch $BRANCH";then
    true
else
    git branch $BRANCH >>$SLACK 2>&1
    git checkout $BRANCH >>$SLACK 2>&1
fi

git fetch --all >$SLACK 2>&1
git reset --hard origin/$BRANCH >>$SLACK 2>&1
if [ $(hostname) == 'staging' ];then
    git log --pretty=format:"%h - %an, %ar : %s" -1 > dist/gitinfo.txt
fi

# Build the project
npm ci >$NPMLOG 2>&1
npm run generate -- --no-lock >>$NPMLOG 2>&1
cp robots.txt dist/
cd dist
ln -sf index.html app.html

URL="https://slack.com/api/chat.postMessage"
curl -s -X POST\
 -F "username=bitbucket"\
 -F "token=xoxb-345566889616-YSbAVZQbiKhgqGJOeUbhxvFx"\
 -F "channel=bitbucket"\
 -F "text=*$(hostname): Frontened v2 deployment finished*\`\`\`$(cat $SLACK)\`\`\`
You can view the full log at https://v2.cloudradar.info/deployment-npm.log" $URL
