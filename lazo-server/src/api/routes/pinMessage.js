const router = require('express').Router();
const PinMessageController = require('../controllers/PinMessageController');

const pinMessageRouter = (io) => {
    const pinMessageController = new PinMessageController(io);
    
    router.get('/:conversationId', pinMessageController.getAllPinMessages);

    return router;
};

module.exports = pinMessageRouter;
