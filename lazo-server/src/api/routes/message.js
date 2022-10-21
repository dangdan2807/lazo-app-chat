const router = require('express').Router();
const MessageController = require('../controllers/MessageController');

const messageRouter = (io) => {
    const messageController = new MessageController(io);

    router.get('/:conversationId', messageController.getList);
    router.get('/channel/:channelId', messageController.getListByChannelId);
    router.post('/text', messageController.addText);
    router.get('/:conversationId/files', messageController.getListFiles);
    
    return router;
};

module.exports = messageRouter;
