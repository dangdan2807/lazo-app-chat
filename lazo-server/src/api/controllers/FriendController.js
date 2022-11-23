const friendService = require('../services/FriendService');
const redisDb = require('../../helpers/redis');

// /friends
class FriendController {
    constructor(io) {
        this.io = io;
        this.acceptFriend = this.acceptFriend.bind(this);
        this.sendFriendInvite = this.sendFriendInvite.bind(this);
        this.deleteFriend = this.deleteFriend.bind(this);
        this.deleteFriendInvite = this.deleteFriendInvite.bind(this);
        this.deleteInviteWasSend = this.deleteInviteWasSend.bind(this);
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

    // [DELETE] /friends/:userId
    deleteFriend = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;
        try {
            await friendService.deleteFriend(_id, userId);

            this.io.to(userId + '').emit('deleted-friend', _id);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [GET] /friends/invites
    getListFriendInvites = async (req, res, next) => {
        const { _id } = req;
        try {
            const friendInvites = await friendService.getListInvites(_id);

            res.status(200).json(friendInvites);
        } catch (err) {
            next(err);
        }
    };

    //[DELETE] /friends/invites/:userId
    deleteFriendInvite = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;

        try {
            await friendService.deleteFriendInvite(_id, userId);
            this.io.to(userId + '').emit('deleted-friend-invite', _id);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [GET] /friends/invites/me
    getListFriendInvitesWasSend = async (req, res, next) => {
        const { _id } = req;
        try {
            const friendInvites = await friendService.getListInvitesWasSend(_id);

            res.status(200).json(friendInvites);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /friends/invites/me/:userId
    sendFriendInvite = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;
        try {
            await friendService.sendFriendInvite(_id, userId);

            const { name, avatar } = await redisDb.get(_id);
            this.io.to(userId + '').emit('send-friend-invite', { _id, name, avatar });

            res.status(201).json({
                success: true,
                message: 'Send friend invite successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    //[DELETE] /friends/invites/me/:userId
    deleteInviteWasSend = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;

        try {
            await friendService.deleteInviteWasSend(_id, userId);
            this.io.to(userId + '').emit('deleted-invite-was-send', _id);
            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [GET] /friends/suggest
    getSuggestFriends = async (req, res, next) => {
        const { _id } = req;
        const { page = 0, size = 12 } = req.query;

        try {
            const suggestFriends = await friendService.getSuggestFriends(
                _id,
                parseInt(page),
                parseInt(size),
            );

            res.status(200).json(suggestFriends);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = FriendController;
