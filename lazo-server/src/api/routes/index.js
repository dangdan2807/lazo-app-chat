const authRouter = require('./auth');

const route = (app, io) => {
    app.use('/auth', authRouter);
};

module.exports = route;
