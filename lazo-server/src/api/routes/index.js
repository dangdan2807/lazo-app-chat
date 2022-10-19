const authRouter = require('./auth');
const userRouter = require('./user');
const classifyRouter = require('./classify');

const commonInfoRouter = require('./commonInfo');

const auth = require('../middleware/auth');

const route = (app, io) => {
    const meRouter = require('./me')(io);
    const friendRouter = require('./friend')(io);
    
    app.use('/auth', authRouter);
    app.use('/users', auth, userRouter);
    app.use('/me', auth, meRouter);
    app.use('/friends', auth, friendRouter);
    app.use('/classifies', auth, classifyRouter);
    app.use('/common', commonInfoRouter);

};

module.exports = route;
