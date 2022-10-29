const voteService = require('../services/VoteService');

class VoteController {
    constructor(io) {
        this.io = io;
        this.addVoteMessage = this.addVoteMessage.bind(this);
    }

    // [GET] /votes/:conversationId
    getListVotesByConversationId = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;
        const { page = 0, size = 10 } = req.query;

        try {
            const votes = await voteService.getListVotesByConversationId(
                conversationId,
                parseInt(page),
                parseInt(size),
                _id
            );

            res.json(votes);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = VoteController;
