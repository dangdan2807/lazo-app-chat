const conversationService = require('../services/ConversationService');
const messageService = require('../services/MessageService');
const memberService = require('../services/MemberService');

const MyError = require('../exception/MyError');

class ConversationController {
    constructor(io) {
        this.io = io;

        this.createIndividualConversation =
            this.createIndividualConversation.bind(this);
        this.createGroupConversation = this.createGroupConversation.bind(this);
        this.rename = this.rename.bind(this);
        this.updateAvatar = this.updateAvatar.bind(this);
        this.updateAvatarWithBase64 = this.updateAvatarWithBase64.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.addManagersForConversation =
            this.addManagersForConversation.bind(this);
        this.deleteManagersForConversation =
            this.deleteManagersForConversation.bind(this);
    }

    // [GET] /conversations?name&type
    getList = async (req, res, next) => {
        const { _id } = req;
        const { name = '', type = 0 } = req.query;

        if (type != 0 && type != 1 && type != 2) {
            res.status(400).json({
                status: 400,
                message: 'Params Type invalid, only 0 or 1 or 2',
            });
        }

        try {
            let conversations;

            if (type == 0) {
                conversations = await conversationService.getList(_id);
            }

            if (type == 1) {
                conversations = await conversationService.getListIndividual(
                    name,
                    _id,
                );
            }

            if (type == 2) {
                conversations = await conversationService.getListGroup(
                    name,
                    _id,
                );
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
            const conversation =
                await conversationService.getSummaryByIdAndUserId(id, _id);

            res.status(200).json(conversation);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /conversations/classifies/:classifyId
    getListByClassifyId = async (req, res, next) => {
        const { _id } = req;
        const { classifyId } = req.params;

        try {
            const conversations =
                await conversationService.getListFollowClassify(
                    classifyId,
                    _id,
                );

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
            const result =
                await conversationService.createIndividualConversation(
                    _id,
                    userId,
                );

            if (!result.isExists) {
                this.io
                    .to(userId + '')
                    .emit('create-individual-conversation', result._id);
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
            console.log(userIds);
            const conversationId =
                await conversationService.createGroupConversation(
                    _id,
                    name,
                    userIds.filter((userIdEle) => userIdEle != _id),
                );

            const userIdsTempt = [_id, ...userIds];
            userIdsTempt.forEach((userIdEle) =>
                this.io
                    .to(userIdEle)
                    .emit('create-conversation', conversationId),
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
                this.io
                    .to(id + '')
                    .emit('rename-conversation', id, name, message);
            }

            res.status(200).json({
                status: 200,
                name,
            });
        } catch (err) {
            next(err);
        }
    };

    //[PATCH] /conversations/:id/avatar
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
    };

    //[PATCH] /conversations/:id/avatar/base64
    updateAvatarWithBase64 = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const { avatar, lastMessage } =
                await conversationService.updateAvatarWithBase64(
                    id,
                    req.body,
                    _id,
                );

            this.io
                .to(id + '')
                .emit('update-avatar-conversation', id, avatar, lastMessage);
            this.io.to(id + '').emit('new-message', id, lastMessage);
            res.json({ avatar, lastMessage });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /conversations/:id/messages
    deleteAllMessage = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            await messageService.deleteAll(id, _id);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /conversations/:id
    deleteById = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            await conversationService.deleteById(id, _id);

            this.io.to(id).emit('delete-conversation', id);
            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [PATCH] /conversations/:id/notify/:isNotify
    updateConversationNotify = async (req, res, next) => {
        const { _id } = req;
        const { id, isNotify } = req.params;

        try {
            if (!isNotify || (isNotify != '0' && isNotify != '1')) {
                throw new MyError('Value isNotify only 0 or 1');
            }
            await conversationService.updateConversationNotify(
                id,
                parseInt(isNotify),
                _id,
            );

            res.status(200).json({
                status: 200,
                message: 'Update conversation notify success',
            });
        } catch (err) {
            next(err);
        }
    };

    // [GET] /conversations/:id/last-view
    getLastViewOfMembers = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            const lastViewOfMembers =
                await conversationService.getLastViewOfMembers(id, _id);

            res.status(200).json(lastViewOfMembers);
        } catch (err) {
            next(err);
        }
    };

    // [PATCH] /conversations/:id/join-from-link/:isStatus
    updateJoinFromLink = async (req, res, next) => {
        const { _id } = req;
        const { id, isStatus } = req.params;

        try {
            if (isStatus !== '0' && isStatus !== '1') {
                throw new MyError('IsStatus must 0 or 1');
            }

            await conversationService.updateJoinFromLink(
                id,
                isStatus === '1' ? true : false,
                _id,
            );

            res.status(200).json({
                status: 200,
                message: 'Update join from link success',
            });
        } catch (err) {
            next(err);
        }
    };

    // [GET] /conversations/:id/summary
    getConversationSummary = async (req, res, next) => {
        const { id } = req.params;

        try {
            const conversationSummary =
                await conversationService.getConversationSummary(id);

            res.status(200).json(conversationSummary);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /conversations/:id/managers
    addManagersForConversation = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;
        const { managerIds } = req.body;

        try {
            const result = await memberService.addManagersForConversation(
                id,
                managerIds,
                _id,
            );
            this.io.to(id + '').emit('add-managers', {
                conversationId: id,
                managerIds: result.managerIds,
            });
            this.io.to(id + '').emit('new-message', id, result.message);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /conversations/:id/managers
    deleteManagersForConversation = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;
        const { managerIds } = req.body;

        try {
            const result = await memberService.deleteManagersForConversation(
                id,
                managerIds,
                _id,
            );

            this.io.to(id + '').emit('delete-managers', {
                conversationId: id,
                managerIds: result.deleteManagerIds,
            });
            this.io.to(id + '').emit('new-message', id, result.message);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = ConversationController;
