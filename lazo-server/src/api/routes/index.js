const authRouter = require('./auth');
const userRouter = require('./user');

const commonInfoRouter = require('./commonInfo');

const auth = require('../middleware/auth');

const route = (app, io) => {
    app.use('/auth', authRouter);
    app.use('/users', auth, userRouter);

    app.use('/common', commonInfoRouter);

};

module.exports = route;
