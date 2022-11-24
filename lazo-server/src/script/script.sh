#!/bin/bash

sudo pm2 stop lazochat

cd ..

sudo git restore .

sudo git pull

sudo rm lazochat/.env

sudo cp .env lazochat/.env

echo "wait npm i"

wait sudo npm i

cd ..

sudo pm2 start lazochat/src/index.js --name lazochat