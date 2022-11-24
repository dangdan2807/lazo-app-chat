# Lazo App Chat - Server - NodeJs

## Deloy Server
 * [http://13.212.201.145](http://13.212.201.145)
 * [https://13.212.201.145](https://13.212.201.145)

## Api Document

**Api document**: [HERE](https://dangdan2807.gitbook.io/lazo-chat-api-docs/reference/api-reference)

## Cách chạy
```
npm install  
npm start
```
Chạy trên cổng `3001`.

## Cách deloy EC2

1. set up EC2 - ubuntu
```
sudo apt update

sudo apt install npm

sudo git clone https://github.com/dangdan2807/web-chat

cd web-chat/lazo-server

sudo npm install

# config .env

sudo npm i pm2 -g

```
  
2. run server
```
sudo pm2 start src/server.js --name lazo-server
```

3. fix bug cache
```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

4. pm2 command

- Show log
```
sudo pm2 log
```
- Show list app in PM2
```
sudo pm2 list
```
- Stop app using
```
sudo pm2 stop all
```
- Reloac app using
```
sudo pm2 reload all
```
- stop 1 process pm2
```
sudo pm2 stop lazo-server
```