const authRouter = require('./auth');
const userRouter = require('./user');
const classifyRouter = require('./classify');

const commonInfoRouter = require('./commonInfo');

const auth = require('../middleware/auth');

const route = (app, io) => {
    const meRouter = require('./me')(io);
    const friendRouter = require('./friend')(io);
    const messageRouter = require('./message')(io);
    const channelRouter = require('./channel')(io);
    const conversationRouter = require('./conversation')(io);
    const pinMessageRouter = require('./pinMessage')(io);
    
    app.use('/auth', authRouter);
    app.use('/users', auth, userRouter);
    app.use('/me', auth, meRouter);
    app.use('/friends', auth, friendRouter);
    app.use('/classifies', auth, classifyRouter);
    app.use('/messages', auth, messageRouter);
    app.use('/conversations', auth, conversationRouter);
    app.use('/pin-messages', auth, pinMessageRouter);
    app.use('/channels', auth, channelRouter);
    app.use('/common', commonInfoRouter);

};

module.exports = route;
