const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Channel = require('../models/Channel');

const lastViewService = require('../services/LastViewService');
const awsS3Service = require('../services/AwsS3Service');

const messageValidate = require('../validate/messageValidate');

const messageUtils = require('../../utils/messageUtils');
const commonUtils = require('../../utils/commonUtils');
const dateUtils = require('../../utils/dateUtils');

const ArgumentError = require('../exception/ArgumentError');
const MyError = require('../exception/MyError');

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
    };

    getListByChannelId = async (channelId, userId, page, size) => {
        if (!channelId || !userId || !size || page < 0 || size <= 0) {
            throw new ArgumentError();
        }

        const channel = await Channel.getById(channelId);
        const { conversationId } = channel;
        await Conversation.getByIdAndUserId(conversationId, userId);

        const totalMessages = await Message.countDocuments({
            channelId,
            deletedUserIds: {
                $nin: [userId],
            },
        });
        const { skip, limit, totalPages } = commonUtils.getPagination(page, size, totalMessages);

        const messagesTempt = await Message.getListByChannelIdAndUserId(
            channelId,
            userId,
            skip,
            limit,
        );
        const messages = messagesTempt.map((messageEle) =>
            messageUtils.convertMessageOfGroup(messageEle),
        );

        await lastViewService.updateLastViewOfChannel(conversationId, channelId, userId);

        return {
            data: messages,
            page,
            size,
            totalPages,
            conversationId,
        };
    };

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

    // send file
    addFile = async (file, type, conversationId, channelId, userId) => {
        await messageValidate.validateFileMessage(file, type, conversationId, channelId, userId);

        // upload ảnh
        const content = await awsS3Service.uploadFile(file);

        const newMessageTempt = {
            userId,
            content,
            type,
        };

        if (channelId) {
            newMessageTempt.channelId = channelId;
        } else {
            newMessageTempt.conversationId = conversationId;
        }

        const newMessage = new Message({
            ...newMessageTempt,
        });

        // lưu xuống
        const saveMessage = await newMessage.save();

        return this.updateWhenHasNewMessage(saveMessage, conversationId, userId);
    }

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

    getListFiles = async (conversationId, userId, type, senderId, startTime, endTime) => {
        if (type !== 'IMAGE' && type !== 'VIDEO' && type !== 'FILE') {
            throw new MyError('Message type invalid, only image, video, file');
        }

        const startDate = dateUtils.toDate(startTime);
        const endDate = dateUtils.toDate(endTime);

        await Conversation.getByIdAndUserId(conversationId, userId);

        const query = {
            conversationId,
            type,
            isDeleted: false,
            deletedUserIds: { $nin: [userId] },
        };

        if (senderId) {
            query.userId = senderId;
        }

        if (startDate && endDate) {
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        const files = await Message.find(query, {
            userId: 1,
            content: 1,
            type: 1,
            createdAt: 1,
        });

        return files;
    };

    getAllFiles = async (conversationId, userId) => {
        await Conversation.getByIdAndUserId(conversationId, userId);

        const images = await Message.getListFilesByTypeAndConversationId(
            'IMAGE',
            conversationId,
            userId,
            0,
            8,
        );

        const videos = await Message.getListFilesByTypeAndConversationId(
            'VIDEO',
            conversationId,
            userId,
            0,
            8,
        );
        const files = await Message.getListFilesByTypeAndConversationId(
            'FILE',
            conversationId,
            userId,
            0,
            8,
        );

        return {
            images,
            videos,
            files,
        };
    };
}

module.exports = new MessageService();
