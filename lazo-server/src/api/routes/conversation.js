const router = require('express').Router();
const ConversationController = require('../controllers/ConversationController');

const conversationRouter = (io) => {
    const conversationController = new ConversationController(io);

    router.get('', conversationController.getList);
    
    return router;
};

module.exports = conversationRouter;
