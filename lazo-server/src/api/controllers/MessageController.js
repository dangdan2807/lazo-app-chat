const messageService = require('../services/MessageService');
const MyError = require('../exception/MyError');

class MessageController {
    constructor(io) {
        this.io = io;
        this.getList = this.getList.bind(this);
        this.getListByChannelId = this.getListByChannelId.bind(this);
        this.addText = this.addText.bind(this);
        this.addFile = this.addFile.bind(this);
    }

    // [GET] /messages/:conversationId
    getList = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;
        const { page = 0, size = 20 } = req.query;

        try {
            const messages = await messageService.getList(
                conversationId,
                _id,
                parseInt(page),
                parseInt(size),
            );

            this.io.to(conversationId + '').emit('user-last-view', {
                conversationId,
                userId: _id,
                lastView: new Date(),
            });

            res.status(200).json(messages);
        } catch (error) {
            next(error);
        }
    };

    // [GET] /channel/:channelId
    getListByChannelId = async (req, res, next) => {
        const { _id } = req;
        const { channelId } = req.params;
        const { page = 0, size = 20 } = req.query;

        try {
            const result = await messageService.getListByChannelId(
                channelId,
                _id,
                parseInt(page),
                parseInt(size),
            );

            this.io.to(result.conversationId + '').emit('user-last-view', {
                conversationId: result.conversationId,
                channelId,
                userId: _id,
                lastView: new Date(),
            });

            res.json({
                data: result.data,
                page: result.page,
                size: result.size,
                totalPages: result.totalPages,
            });
        } catch (error) {
            next(error);
        }
    };

    //[POST] /channel/text  tin nhắn dạng text
    addText = async (req, res, next) => {
        const { _id } = req;

        try {
            const { conversationId } = req.body;
            const message = await messageService.addText(req.body, _id);
            const { channelId } = message;

            if (channelId) {
                this.io
                    .to(conversationId + '')
                    .emit('new-message-of-channel', conversationId, channelId, message);
            } else {
                this.io.to(conversationId + '').emit('new-message', conversationId, message);
            }

            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    };

    //[POST] /channel/files  tin nhắn dạng file
    addFile = async (req, res, next) => {
        const { _id, file } = req;
        const { type, conversationId, channelId } = req.query;

        try {
            if (!conversationId || !type) {
                throw new MyError('Params type or conversationId not exists');
            }

            const message = await messageService.addFile(
                file,
                type,
                conversationId,
                channelId,
                _id,
            );

            if (channelId) {
                this.io
                    .to(conversationId + '')
                    .emit('new-message-of-channel', conversationId, channelId, message);
            } else {
                this.io.to(conversationId + '').emit('new-message', conversationId, message);
            }
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /channel/:conversationId/files
    getListFiles = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;
        const { senderId, type = 'ALL', startTime, endTime } = req.query;

        try {
            let files;
            if (type === 'ALL') {
                files = await messageService.getAllFiles(conversationId, _id);
            } else {
                files = await messageService.getListFiles(
                    conversationId,
                    _id,
                    type,
                    senderId,
                    startTime,
                    endTime,
                );
            }

            res.status(200).json(files);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = MessageController;
