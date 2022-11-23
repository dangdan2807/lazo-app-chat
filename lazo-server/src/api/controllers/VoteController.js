const voteService = require('../services/VoteService');
const messageService = require('../services/MessageService');

// votes
class VoteController {
    constructor(io) {
        this.io = io;
        this.addVoteMessage = this.addVoteMessage.bind(this);
        this.addOptions = this.addOptions.bind(this);
        this.deleteOptions = this.deleteOptions.bind(this);
        this.addVoteChoices = this.addVoteChoices.bind(this);
        this.deleteVoteChoices = this.deleteVoteChoices.bind(this);
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
                _id,
            );

            res.status(200).json(votes);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /votes
    addVoteMessage = async (req, res, next) => {
        const { _id } = req;

        try {
            const voteMessage = await messageService.addVoteMessage(
                req.body,
                _id,
            );
            const { conversationId } = voteMessage;
            this.io
                .to(conversationId + '')
                .emit('new-message', conversationId, voteMessage);

            res.status(201).json(voteMessage);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /votes/:messageId
    addOptions = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;
        const { options } = req.body;

        try {
            await voteService.addOptions(
                messageId,
                Array.from(new Set(options)),
                _id,
            );

            const voteMessage = await messageService.getById(messageId, true);
            const { conversationId } = voteMessage;
            this.io
                .to(conversationId + '')
                .emit('update-vote-message', conversationId, voteMessage);

            res.status(201).json(voteMessage);
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /votes/:messageId
    deleteOptions = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;
        const { options } = req.body;

        try {
            await voteService.deleteOptions(
                messageId,
                Array.from(new Set(options)),
                _id,
            );

            const voteMessage = await messageService.getById(messageId, true);
            const { conversationId } = voteMessage;
            this.io
                .to(conversationId + '')
                .emit('update-vote-message', conversationId, voteMessage);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [POST] /votes/:messageId/choices
    addVoteChoices = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;
        const { options } = req.body;

        try {
            await voteService.addVoteChoices(
                messageId,
                Array.from(new Set(options)),
                _id,
            );

            const voteMessage = await messageService.getById(messageId, true);
            const { conversationId } = voteMessage;
            this.io
                .to(conversationId + '')
                .emit('update-vote-message', conversationId, voteMessage);

            res.status(201).json(voteMessage);
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /votes/:messageId/choices
    deleteVoteChoices = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;
        const { options } = req.body;

        try {
            await voteService.deleteVoteChoices(
                messageId,
                Array.from(new Set(options)),
                _id,
            );

            const voteMessage = await messageService.getById(messageId, true);
            const { conversationId } = voteMessage;
            this.io
                .to(conversationId + '')
                .emit('update-vote-message', conversationId, voteMessage);

            res.status(204).json(voteMessage);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = VoteController;
