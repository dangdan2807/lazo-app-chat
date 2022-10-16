const redisDb = require('./redis');

const socket = (io) => {
    io.on('connect', (socket) => { });
};

module.exports = socket;