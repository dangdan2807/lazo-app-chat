const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const commonUtils = require('../../utils/commonUtils');
const messageUtils = require('../../utils/messageUtils');

const MyError = require('../exception/MyError');
const ArgumentError = require('../exception/ArgumentError');

const VOTE = 'VOTE';

class VoteService {
    getListVotesByConversationId = async (conversationId, page, size, myId) => {
        if (!conversationId || !size || page < 0 || size <= 0) {
            throw new ArgumentError();
        }

        const conversation = await Conversation.getByIdAndUserId(conversationId, myId);
        const { type } = conversation;
        if (!type) {
            throw new MyError('Only group conversation');
        }

        const totalVoteMessages = await Message.countDocuments({
            conversationId,
            type: VOTE,
        });

        const { skip, limit, totalPages } = commonUtils.getPagination(
            page,
            size,
            totalVoteMessages,
        );

        const messagesTempt = await Message.getListByConversationIdAndTypeAndUserId(
            conversationId,
            VOTE,
            myId,
            skip,
            limit,
        );

        const messages = messagesTempt.map((messageEle) =>
            messageUtils.convertMessageOfGroup(messageEle),
        );

        return {
            data: messages,
            page,
            size,
            totalPages,
        };
    };

    addOptions = async (messageId, optionNames, userId) => {
        const message = await this.validateVote(messageId, optionNames, userId);
        const availableOptionNames = message.options.map((optionEle) => optionEle.name);
        optionNames.forEach((optionNameEle) => {
            if (
                !(
                    !optionNameEle ||
                    optionNameEle.length === 0 ||
                    optionNameEle.length > 200 ||
                    availableOptionNames.includes(optionNameEle)
                )
            )
                message.options.push({ name: optionNameEle, userIds: [] });
        });

        await message.save();
    };

    validateVote = async (messageId, optionNames, userId) => {
        if (!optionNames || optionNames.length === 0) {
            throw new MyError('Options not empty');
        }

        const message = await Message.getById(messageId);
        const { type, conversationId } = message;
        await Conversation.getByIdAndUserId(conversationId, userId);

        if (type !== 'VOTE') {
            throw new MyError('Only vote message');
        }

        return message;
    };
}

module.exports = new VoteService();
