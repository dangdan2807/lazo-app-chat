const pinMessageService = require('../services/PinMessageService');

class PinMessageController {
    constructor(io) {
        this.io = io;

        this.addPinMessage = this.addPinMessage.bind(this);
        this.deletePinMessage = this.deletePinMessage.bind(this);
    }

    // [GET] /pin-messages/:conversationId
    getAllPinMessages = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;

        try {
            const pinMessages = await pinMessageService.getAll(conversationId, _id);

            res.status(200).json(pinMessages);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /pin-messages/:messageId
    addPinMessage = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;

        try {
            const { conversationId, message } = await pinMessageService.add(messageId, _id);

            this.io.to(conversationId + '').emit('new-message', conversationId, message);
            this.io.to(conversationId + '').emit('action-pin-message', conversationId);

            res.status(201).json({ status: 201, conversationId, message });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /pin-messages/:messageId
    deletePinMessage = async (req, res, next) => {
        const { _id } = req;
        const { messageId } = req.params;

        try {
            const { conversationId, message } = await pinMessageService.delete(messageId, _id);

            this.io.to(conversationId + '').emit('new-message', conversationId, message);
            this.io.to(conversationId + '').emit('action-pin-message', conversationId);

            res.status(200).json({ status: 200, conversationId, message });
        } catch (err) {
            next(err);
        }
    };
}

module.exports = PinMessageController;
