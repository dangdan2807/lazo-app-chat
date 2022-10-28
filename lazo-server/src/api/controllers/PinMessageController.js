const pinMessageService = require('../services/PinMessageService');

class PinMessageController {
    constructor(io) {
        this.io = io;
    }

    // [GET] /pin-messages/:conversationId
    getAllPinMessages = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;

        try {
            const pinMessages = await pinMessageService.getAll(
                conversationId,
                _id
            );

            res.status(200).json(pinMessages);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = PinMessageController;
