const conversationService = require('../services/ConversationService');

class ConversationController {
    constructor(io) {
        this.io = io;
        this.createIndividualConversation.bind(this);
    }

    // [GET] /conversations?name&type
    getList = async (req, res, next) => {
        const { _id } = req;
        const { name = '', type = 0 } = req.query;

        if (type != 0 && type != 1 && type != 2) {
            res.status(400).json({
                message: 'Params Type invalid, only 0 or 1 or 2',
            });
        }

        try {
            let conversations;

            if (type == 0) {
                conversations = await conversationService.getList(_id);
            }

            if (type == 1) {
                conversations = await conversationService.getListIndividual(name, _id);
            }

            if (type == 2) {
                conversations = await conversationService.getListGroup(name, _id);
            }

            res.status(200).json(conversations);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /conversations/:id
    getOne = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const conversation = await conversationService.getSummaryByIdAndUserId(id, _id);

            res.status(200).json(conversation);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /conversations/:classifyId
    getListByClassifyId = async (req, res, next) => {
        const { _id } = req;
        const { classifyId } = req.params;

        try {
            const conversations = await conversationService.getListFollowClassify(classifyId, _id);

            res.status(200).json(conversations);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /conversations/individuals/:userId
    createIndividualConversation = async (req, res, next) => {
        const { _id } = req;
        const { userId } = req.params;

        try {
            const result = await conversationService.createIndividualConversation(_id, userId);

            if (!result.isExists) {
                this.io.to(userId + '').emit('create-individual-conversation', result._id);
            }
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /conversations/groups
    createGroupConversation = async (req, res, next) => {
        const { _id } = req;
        const { name = '', userIds = [] } = req.body;

        try {
            const conversationId =
                await conversationService.createGroupConversation(
                    _id,
                    name,
                    userIds.filter((userIdEle) => userIdEle != _id)
                );

            const userIdsTempt = [_id, ...userIds];
            userIdsTempt.forEach((userIdEle) =>
                this.io
                    .to(userIdEle)
                    .emit('create-conversation', conversationId)
            );

            res.status(201).json({ _id: conversationId });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ConversationController;
