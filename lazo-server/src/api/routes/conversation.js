const router = require('express').Router();
const ConversationController = require('../controllers/ConversationController');

const conversationRouter = (io) => {
    const conversationController = new ConversationController(io);

    router.get('', conversationController.getList);
    router.get('/:id', conversationController.getOne);
    router.get(
        '/classifies/:classifyId',
        conversationController.getListByClassifyId
    );
    
    return router;
};

module.exports = conversationRouter;
