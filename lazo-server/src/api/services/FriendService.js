const User = require('../models/User');
const Friend = require('../models/Friend');
const FriendRequest = require('../models/FriendRequest');

const conversationService = require('./ConversationService');

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
}

module.exports = new FriendService();
