#!/bin/bash

# update the config-file
echo "=====> cp -v ../pages/api/config.js ."
cp -v ../pages/api/config.js .
# stop running node server
echo "=====> ssh pi@raspberrypi \"cd garmin-login-api-server && npm run stop\""
ssh pi@raspberrypi "cd garmin-login-api-server && npm run stop"
# remove remote folder
echo "=====> ssh pi@raspberrypi \"rm -rf garmin-login-api-server\""
ssh pi@raspberrypi "rm -rf garmin-login-api-server"
# copy local folder to remote server including dot-files
echo "=====> scp -rp \"${PWD}\" pi@raspberrypi:garmin-login-api-server/"
scp -rp "${PWD}" pi@raspberrypi:garmin-login-api-server/
# start server with output to local console
echo "=====> ssh pi@raspberrypi -f \'screen -d -m && cd garmin-login-api-server && npm run start\'"
ssh pi@raspberrypi -f 'screen -d -m && cd garmin-login-api-server && npm run start'
