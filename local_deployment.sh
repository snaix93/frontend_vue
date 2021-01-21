#!/bin/bash
set -e

#
# This script is executed on the destination host after the build is finished
# The Bitbucket Pipeline executes the script over SSH using the default www-data user
#
test -z $BUILD&&exit 1
echo "Installing $BUILD now"

test -e /tmp/$BUILD
# Unpack the build to a tmp dir
test -e /var/www/.frontend_v3 && rm -rf /var/www/.frontend_v3
mkdir /var/www/.frontend_v3
tar xzf /tmp/$BUILD -C /var/www/.frontend_v3
# Rotate the so the new folder becomes the live folder
cd /var/www
test -e frontend_v3||mkdir frontend_v3
mv frontend_v3 _frontend_v3 && mv .frontend_v3 frontend_v3 && rm -rf _frontend_v3
rm -f $BUILD