const MyError = require('../exception/MyError');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Channel = require('../models/Channel');

const messageValidate = {
    validateTextMessage: async (message, userId) => {
        const { content, type, replyMessageId, tags, conversationId, channelId } = message;

        // check type
        if (
            !type ||
            (type !== 'TEXT' && type !== 'HTML' && type !== 'NOTIFY' && type !== 'STICKER')
        ) {
            throw new MyError('Type only TEXT, HTML, NOTIFY, STICKER');
        }

        if (!content) {
            throw new MyError('Content not empty');
        }

        // check userIds có trong conversation
        let userIds = [];
        if (tags) {
            const index = tags.findIndex((userIdEle) => userIdEle == userId);

            if (index !== -1) {
                throw new MyError('No tag yourself');
            }
            userIds = [...tags];
        }

        userIds.push(userId);
        await Conversation.existsByUserIds(conversationId, userIds);
        // check replyMessageId có tồn tại
        if (replyMessageId) {
            if (channelId) {
                await Message.getByIdAndChannelId(replyMessageId, channelId);
            } else {
                await Message.getByIdAndConversationId(replyMessageId, conversationId);
            }
        }

        if (channelId) {
            await Channel.getByIdAndConversationId(channelId, conversationId);
        }
    },
    validateImageWithBase64(fileInfo) {
        const { fileName, fileExtension, fileBase64 } = fileInfo;

        if (!fileName || !fileExtension || !fileBase64) {
            throw new MyError('Info image with base64 invalid');
        }
        if (
            fileExtension !== '.png' &&
            fileExtension !== '.jpg' &&
            fileExtension !== '.jpeg' &&
            fileExtension !== '.gif'
        ) {
            throw new MyError('Image extension invalid');
        }
    },
};

module.exports = messageValidate;
