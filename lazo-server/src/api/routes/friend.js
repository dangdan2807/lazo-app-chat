const router = require('express').Router();
const FriendController = require('../controllers/FriendController');

const friendRouter = (io) => {
    const friendController = new FriendController(io);

    router.get('', friendController.getListFriends);
    router.post('/:userId', friendController.acceptFriend);
    router.delete('/:userId', friendController.deleteFriend);
    
    return router;
};

module.exports = friendRouter;
