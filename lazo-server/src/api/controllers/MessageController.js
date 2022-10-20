const messageService = require('../services/MessageService');

class MessageController {
    constructor(io) {
        this.io = io;
        this.getList = this.getList.bind(this);
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
                parseInt(size)
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
    }
}

module.exports = MessageController;
