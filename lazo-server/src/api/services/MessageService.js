const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const lastViewService = require('../services/LastViewService');

const messageValidate = require('../validate/messageValidate');

const messageUtils = require('../../utils/messageUtils');

class MessageService {
    getById = async (_id, type) => {
        if (type) {
            const message = await Message.getByIdOfGroup(_id);

            return messageUtils.convertMessageOfGroup(message);
        }

        const message = await Message.getByIdOfIndividual(_id);
        return messageUtils.convertMessageOfIndividual(message);
    }

    // send text
    addText = async (message, userId) => {
        // validate
        await messageValidate.validateTextMessage(message, userId);

        const { channelId, conversationId } = message;
        if (channelId) {
            delete message.conversationId;
        }

        const newMessage = new Message({
            userId,
            ...message,
        });

        // lưu xuống
        const saveMessage = await newMessage.save();

        return this.updateWhenHasNewMessage(saveMessage, conversationId, userId);
    };

    updateWhenHasNewMessage = async (saveMessage, conversationId, userId) => {
        const { _id, channelId } = saveMessage;

        if (channelId) {
            await lastViewService.updateLastViewOfChannel(
                conversationId,
                channelId,
                userId
            );
        } else {
            await Conversation.updateOne(
                { _id: conversationId },
                { lastMessageId: _id }
            );

            await lastViewService.updateLastViewOfConversation(
                conversationId,
                userId
            );
        }

        const { type } = await Conversation.findById(conversationId);

        return await this.getById(_id, type);
    }
}

module.exports = new MessageService();
