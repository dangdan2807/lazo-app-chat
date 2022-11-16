const authRouter = require('./authRouter');
const userRouter = require('./userRouter');
const classifyRouter = require('./classifyRouter');
const stickerRouter = require('./stickerRouter');
const stickerManagerRouter = require('./stickerManagerRouter');
const userManagerRouter = require('./userManagerRouter');
const commonInfoRouter = require('./commonInfoRouter');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const route = (app, io) => {
    const meRouter = require('./meRouter')(io);
    const friendRouter = require('./friendRouter')(io);
    const messageRouter = require('./messageRouter')(io);
    const conversationRouter = require('./conversationRouter')(io);
    const pinMessageRouter = require('./pinMessageRouter')(io);
    const voteRouter = require('./voteRouter')(io);
    const channelRouter = require('./channelRouter')(io);

    app.use('/auth', authRouter);
    app.use('/users', auth, userRouter);
    app.use('/me', auth, meRouter);
    app.use('/friends', auth, friendRouter);
    app.use('/classifies', auth, classifyRouter);
    app.use('/messages', auth, messageRouter);
    app.use('/conversations', auth, conversationRouter);
    app.use('/pin-messages', auth, pinMessageRouter);
    app.use('/votes', auth, voteRouter);
    app.use('/stickers', auth, stickerRouter);
    app.use('/channels', auth, channelRouter);
    app.use('/admin/stickers-manager', auth, adminAuth, stickerManagerRouter);
    app.use('/admin/users-manager', auth, adminAuth, userManagerRouter);
    app.use('/common', commonInfoRouter);
};

module.exports = route;
