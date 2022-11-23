require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');
const routes = require('./api/routes/index');
const db = require('./config/db');
const socketio = require('socket.io');
const socket = require('./helpers/socket');
const handleErr = require('./api/middleware/handleErr');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const useragent = require('express-useragent');
db.connect();

app.use(morgan('common'));
app.use(cors());
app.use(useragent.express());

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

const isHttps = process.env.HTTPS === 'true';
if (isHttps) {
    // https
    let key = "";
    let cert = "";
    try {
        key = fs.readFileSync('./https/private.key');
        cert = fs.readFileSync('./https/certificate.crt');
    } catch (error) {
        console.log(error);
    }

    const serverHttps = https.createServer(
        {
            key,
            cert,
        },
        app,
    );

    const ioHttps = socketio(serverHttps);
    socket(ioHttps);
    routes(app, ioHttps);

    const HTTPS_PORT = process.env.HTTPS_PORT || 443;
    serverHttps.listen(HTTPS_PORT, function () {
        console.log('App https listening at http://localhost:' + HTTPS_PORT);
    });
} else {
    // http
    const server = http.createServer(app);
    const io = socketio(server);
    socket(io);
    routes(app, io);

    app.use(handleErr);

    const HTTP_PORT = process.env.HTTP_PORT || 80;
    server.listen(HTTP_PORT, function () {
        console.log('App listening at http://localhost:' + HTTP_PORT);
    });
}
