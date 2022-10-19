const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/User');
const Friend = require('../models/Friend');
const FriendRequest = require('../models/FriendRequest');

const userService = require('./UserService');
const conversationService = require('./ConversationService');

const MyError = require('../exception/MyError');

class FriendService {
    getList = async (name, _id) => {
        await User.getById(_id);

        const friends = await Friend.aggregate([
            { $project: { _id: 0, userIds: 1 } },
            {
                $match: {
                    userIds: { $in: [ObjectId(_id)] },
                },
            },
            { $unwind: '$userIds' },
            {
                $match: {
                    userIds: { $ne: ObjectId(_id) },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userIds',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $replaceWith: '$user' },
            {
                $match: {
                    name: { $regex: name, $options: 'i' },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    avatar: 1,
                    avatarColor: 1,
                },
            },
        ]);

        return friends;
    };

    // transaction
    acceptFriend = async (_id, senderId) => {
        // check có lời mời này không
        await FriendRequest.checkByIds(senderId, _id);

        // check đã là bạn bè
        if (await Friend.existsByIds(_id, senderId)) {
            throw new MyError('Friend exists');
        }

        // xóa đi lời mời
        await FriendRequest.deleteOne({ senderId, receiverId: _id });

        // thêm bạn bè
        const friend = new Friend({ userIds: [_id, senderId] });
        await friend.save();

        return await conversationService.createIndividualConversationWhenWasFriend(_id, senderId);
    };

    deleteFriend = async (_id, userId) => {
        // xóa bạn bè
        await Friend.deleteByIds(_id, userId);
    }

    getListInvites = async (_id) => {
        const users = await FriendRequest.aggregate([
            { $match: { receiverId: ObjectId(_id) } },
            { $project: { _id: 0, senderId: 1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'senderId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            { $replaceWith: '$user' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    avatar: 1,
                    avatarColor: 1,
                },
            },
        ]);

        const usersResult = [];

        for (const userEle of users) {
            const userTempt = {
                ...userEle,
                numberCommonGroup: await userService.getNumberCommonGroup(
                    _id,
                    userEle._id
                ),
                numberCommonFriend: await userService.getNumberCommonFriend(
                    _id,
                    userEle._id
                ),
            };

            usersResult.push(userTempt);
        }

        return usersResult;
    }

    deleteFriendInvite = async (_id, senderId) => {
        await FriendRequest.deleteByIds(senderId, _id);
    }
}

module.exports = new FriendService();
