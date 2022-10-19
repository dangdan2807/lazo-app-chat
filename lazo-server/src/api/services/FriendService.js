const User = require('../models/User');
const Friend = require('../models/Friend');

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
    }
}

module.exports = new FriendService();
