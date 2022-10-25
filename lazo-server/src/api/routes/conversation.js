const router = require('express').Router();
const ConversationController = require('../controllers/ConversationController');
const uploadFile = require('../middleware/uploadFile');

const conversationRouter = (io) => {
    const conversationController = new ConversationController(io);

    router.get('', conversationController.getList);
    router.get('/:id', conversationController.getOne);
    router.get(
        '/classifies/:classifyId',
        conversationController.getListByClassifyId
    );
    router.post(
        '/individuals/:userId',
        conversationController.createIndividualConversation
    );
    router.post('/groups', conversationController.createGroupConversation);
    router.patch('/:id/name', conversationController.rename);
    router.patch(
        '/:id/avatar',
        uploadFile.singleUploadMiddleware,
        conversationController.updateAvatar
    );
    router.patch(
        '/:id/avatar/base64',
        conversationController.updateAvatarWithBase64
    );
    router.delete('/:id/messages', conversationController.deleteAllMessage);
    router.delete('/:id', conversationController.deleteById);

    return router;
};

module.exports = conversationRouter;
