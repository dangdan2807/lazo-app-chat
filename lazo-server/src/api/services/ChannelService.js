const Channel = require('../models/Channel');
const Member = require('../models/Member');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

class ChannelService {
    getAllByConversationId = async (conversationId, userId) => {
        await Conversation.getByIdAndUserId(conversationId, userId);

        const channels = await Channel.find(
            { conversationId },
            { name: 1, conversationId: 1, createdAt: 1 },
        );

        const channelsResult = [];
        for (const channelEle of channels) {
            const { _id, name, createdAt } = channelEle;

            const numberUnread = await this.getNumberUnread(conversationId, channelEle._id, userId);

            channelsResult.push({
                _id,
                name,
                createdAt,
                numberUnread,
                conversationId,
            });
        }

        return channelsResult;
    };

    getNumberUnread = async (conversationId, channelId, userId) => {
        const member = await Member.findOne({ conversationId, userId });

        const { lastViewOfChannels } = member;
        const index = lastViewOfChannels.findIndex((ele) => ele.channelId + '' == channelId + '');

        if (index !== -1) {
            const { lastView } = lastViewOfChannels[index];

            return await Message.countDocuments({
                createdAt: { $gt: lastView },
                channelId,
            });
        } else {
            return await Message.countDocuments({ channelId });
        }
    };

}

module.exports = new ChannelService();
