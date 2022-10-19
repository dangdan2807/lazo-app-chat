const friendService = require('../services/FriendService');
const redisDb = require('../../helpers/redis');

// /friends
class FriendController {
    constructor(io) {
        this.io = io;
    }

    // [GET] /friends/?name
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
    }
}

module.exports = FriendController;
