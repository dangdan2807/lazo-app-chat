const Conversation = require('../models/Conversation');
const Channel = require('../models/Channel');

const MyError = require('../exception/MyError');

class ChannelValidate {
    validateChannelRequest = async (channelRequest, userId) => {
        const { name, conversationId } = channelRequest;

        if (
            !name ||
            typeof name !== 'string' ||
            name.length === 0 ||
            name.length > 100
        ) {
            throw new MyError('Channel name invalid,  0 < length <= 100');
        }

        const { type } = await Conversation.getByIdAndUserId(
            conversationId,
            userId,
        );

        if (!type) {
            throw new MyError('Only conversation group');
        }

        if (await Channel.findOne({ name, conversationId })) {
            throw new MyError('Channel name exists');
        }
    };
}

module.exports = new ChannelValidate();