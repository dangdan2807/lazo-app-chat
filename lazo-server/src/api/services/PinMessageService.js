const Conversation = require('../models/Conversation');

const messageService = require('../services/MessageService');

const MyError = require('../exception/MyError');

class PinMessageService {
    getAll = async (conversationId, userId) => {
        const conversation = await Conversation.getByIdAndUserId(conversationId, userId);
        const { type, pinMessageIds } = conversation;

        if (!type) {
            throw new MyError('Only group conversation');
        }

        const pinMessagesResult = [];
        for (const messageId of pinMessageIds) {
            pinMessagesResult.push(await messageService.getById(messageId, type));
        }

        return pinMessagesResult;
    };
}

module.exports = new PinMessageService();
