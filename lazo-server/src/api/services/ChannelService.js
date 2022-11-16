const ObjectId = require('mongoose').Types.ObjectId;

const Channel = require('../models/Channel');
const Member = require('../models/Member');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const messageService = require('../services/MessageService');

const channelValidate = require('../validate/channelValidate');

const MyError = require('../exception/MyError');

const CREATE_CHANNEL = 'CREATE_CHANNEL';
const UPDATE_CHANNEL = 'UPDATE_CHANNEL';
const DELETE_CHANNEL = 'DELETE_CHANNEL';

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

            const numberUnread = await this.getNumberUnread(
                conversationId,
                channelEle._id,
                userId,
            );

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
        const index = lastViewOfChannels.findIndex(
            (ele) => ele.channelId + '' == channelId + '',
        );

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

    add = async (channelRequest, userId) => {
        await channelValidate.validateChannelRequest(channelRequest, userId);

        const { name, conversationId } = channelRequest;

        const newChannel = new Channel({
            name,
            conversationId,
        });

        const saveChannel = await newChannel.save();
        await Member.updateMany(
            { conversationId },
            {
                $push: {
                    lastViewOfChannels: {
                        channelId: saveChannel._id,
                        lastView: new Date(),
                    },
                },
            },
        );

        const message = await messageService.addNotifyMessage(
            CREATE_CHANNEL,
            conversationId,
            userId,
        );

        return {
            channel: saveChannel,
            message,
        };
    };

    update = async (channelRequest, userId) => {
        const { _id, name } = channelRequest;

        const channel = await Channel.getById(_id);
        const { conversationId } = channel;

        await channelValidate.validateChannelRequest({ name, conversationId }, userId);

        await Channel.updateOne({ _id }, { $set: { name } });

        const message = await messageService.addNotifyMessage(
            UPDATE_CHANNEL,
            conversationId,
            userId,
        );

        return {
            channel: {
                _id,
                name,
                conversationId,
            },
            message,
        };
    };

    deleteById = async (channelId, userId) => {
        const channel = await Channel.getById(channelId);
        const { conversationId } = channel;
        const conversation = await Conversation.getById(conversationId);

        if (conversation.leaderId + '' != userId) {
            throw new MyError('Delete channel fail, not leader');
        }

        // delete all tin nhắn
        Promise.all([
            await Message.deleteMany({ conversationId: channelId }),
            await Channel.deleteOne({ _id: channelId }),
            await Member.updateMany(
                { conversationId },
                { $pull: { lastViewOfChannels: { channelId } } },
            ),
        ]).then();

        const message = await messageService.addNotifyMessage(
            DELETE_CHANNEL,
            conversationId,
            userId,
        );

        return {
            channelId,
            conversationId,
            message,
        };
    };

    getLastViewOfMembersInChannel = async (channelId, myId) => {
        const channel = await Channel.getById(channelId);
        const { conversationId } = channel;
        await Conversation.getByIdAndUserId(conversationId, myId);

        let members = await Member.aggregate([
            {
                $match: {
                    conversationId: ObjectId(conversationId),
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    _id: 0,
                    user: {
                        _id: 1,
                        name: 1,
                        avatar: 1,
                    },
                    lastViewOfChannels: 1,
                },
            },
            {
                $unwind: '$lastViewOfChannels',
            },
            {
                $match: {
                    'lastViewOfChannels.channelId': ObjectId(channelId),
                },
            },
        ]);

        members = members.map((ele) => ({
            user: ele.user,
            channelId: ele.lastViewOfChannels.channelId,
            lastView: ele.lastViewOfChannels.lastView,
        }));

        return members;
    };
}

module.exports = new ChannelService();
