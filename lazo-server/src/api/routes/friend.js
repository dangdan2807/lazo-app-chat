const router = require('express').Router();
const FriendController = require('../controllers/FriendController');

const friendRouter = (io) => {
    const friendController = new FriendController(io);

    router.get('', friendController.getListFriends);
    router.post('/:userId', friendController.acceptFriend);
    router.delete('/:userId', friendController.deleteFriend);
    router.get('/invites', friendController.getListFriendInvites);
    router.delete('/invites/:userId', friendController.deleteFriendInvite);
    router.get('/invites/me', friendController.getListFriendInvitesWasSend);
    router.post('/invites/me/:userId', friendController.sendFriendInvite);
    
    return router;
};

module.exports = friendRouter;
