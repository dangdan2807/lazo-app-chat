const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const lastViewService = require('../services/LastViewService');

const messageValidate = require('../validate/messageValidate');

const messageUtils = require('../../utils/messageUtils');
const commonUtils = require('../../utils/commonUtils');

const ArgumentError = require('../exception/ArgumentError');

class MessageService {
    getList = async (conversationId, userId, page, size) => {
        if (!conversationId || !userId || !size || page < 0 || size <= 0) {
            throw new ArgumentError();
        }

        const conversation = await Conversation.getByIdAndUserId(conversationId, userId);

        const totalMessages = await Message.countDocumentsByConversationIdAndUserId(
            conversationId,
            userId,
        );

        const { skip, limit, totalPages } = commonUtils.getPagination(page, size, totalMessages);

        let messages;

        if (conversation.type) {
            const messagesTempt = await Message.getListByConversationIdAndUserIdOfGroup(
                conversationId,
                userId,
                skip,
                limit,
            );

            messages = messagesTempt.map((messageEle) =>
                messageUtils.convertMessageOfGroup(messageEle),
            );
        } else {
            const messagesTempt = await Message.getListByConversationIdAndUserIdOfIndividual(
                conversationId,
                userId,
                skip,
                limit,
            );
            messages = messagesTempt.map((messageEle) =>
                messageUtils.convertMessageOfIndividual(messageEle),
            );
        }

        await lastViewService.updateLastViewOfConversation(conversationId, userId);

        return {
            data: messages,
            page,
            size,
            totalPages,
        };
    }

    getById = async (_id, type) => {
        if (type) {
            const message = await Message.getByIdOfGroup(_id);

            return messageUtils.convertMessageOfGroup(message);
        }

        const message = await Message.getByIdOfIndividual(_id);
        return messageUtils.convertMessageOfIndividual(message);
    };

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
            await lastViewService.updateLastViewOfChannel(conversationId, channelId, userId);
        } else {
            await Conversation.updateOne({ _id: conversationId }, { lastMessageId: _id });

            await lastViewService.updateLastViewOfConversation(conversationId, userId);
        }

        const { type } = await Conversation.findById(conversationId);

        return await this.getById(_id, type);
    };
}

module.exports = new MessageService();
