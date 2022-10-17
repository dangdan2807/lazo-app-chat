const authRouter = require('./auth');
const userRouter = require('./user');

const auth = require('../middleware/auth');

const route = (app, io) => {
    app.use('/auth', authRouter);
    app.use('/users', auth, userRouter);

};

module.exports = route;
