const conversationService = require('../services/ConversationService');

const MyError = require('../exception/MyError');

class ConversationController {
    constructor(io) {
        this.io = io;
        this.createIndividualConversation.bind(this);
        this.createGroupConversation = this.createGroupConversation.bind(this);
        this.rename = this.rename.bind(this);
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
            const conversationId = await conversationService.createGroupConversation(
                _id,
                name,
                userIds.filter((userIdEle) => userIdEle != _id),
            );

            const userIdsTempt = [_id, ...userIds];
            userIdsTempt.forEach((userIdEle) =>
                this.io.to(userIdEle).emit('create-conversation', conversationId),
            );

            res.status(201).json({ _id: conversationId });
        } catch (err) {
            next(err);
        }
    };

    //[PATCH]  /conversations/:id/name
    rename = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;
        const { name } = req.body;

        try {
            if (!name) {
                throw new MyError('Name invalid');
            }

            const message = await conversationService.rename(id, name, _id);

            // là group thì bắt sự kiện socket
            if (message) {
                this.io.to(id + '').emit('rename-conversation', id, name, message);
            }

            res.status(200).json({
                success: true,
            });
        } catch (err) {
            next(err);
        }
    };

    //[PATCH] /:id/avatar
    updateAvatar = async (req, res, next) => {
        const { _id, file } = req;
        const { id } = req.params;

        try {
            const { avatar, lastMessage } =
                await conversationService.updateAvatar(id, file, _id);

            this.io
                .to(id + '')
                .emit('update-avatar-conversation', id, avatar, lastMessage);

            this.io.to(id + '').emit('new-message', id, lastMessage);
            
            res.status(200).json({ avatar, lastMessage });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = ConversationController;
