const friendService = require('../services/FriendService');
const redisDb = require('../../helpers/redis');

// /friends
class FriendController {
    constructor(io) {
        this.io = io;
        this.acceptFriend = this.acceptFriend.bind(this);
    }

    // [GET] /friends?name
    getListFriends = async (req, res, next) => {
        const { _id } = req;
        const { name = '' } = req.query;

        try {
            const friends = await friendService.getList(name, _id);

            const friendsTempt = [];
            for (const friendEle of friends) {
                const friendResult = { ...friendEle };

                const friendId = friendEle._id;
                const cachedUser = await redisDb.get(friendId + '');
                if (cachedUser) {
                    friendResult.isOnline = cachedUser.isOnline;
                    friendResult.lastLogin = cachedUser.lastLogin;
                }

                friendsTempt.push(friendResult);
            }

            res.status(200).json(friendsTempt);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /friends/:userId
    acceptFriend = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;

        try {
            const result = await friendService.acceptFriend(_id, userId);
            const { conversationId, isExists, message } = result;

            const { name, avatar } = await redisDb.get(_id);
            this.io.to(userId + '').emit('accept-friend', { _id, name, avatar });

            if (isExists) {
                this.io.to(conversationId + '').emit('new-message', conversationId, message);
            } else {
                this.io
                    .to(_id + '')
                    .emit('create-individual-conversation-when-was-friend', conversationId);
                this.io
                    .to(userId + '')
                    .emit('create-individual-conversation-when-was-friend', conversationId);
            }

            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = FriendController;
