const conversationService = require('../services/ConversationService');

class ConversationController {
    constructor(io) {
        this.io = io;
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
}

module.exports = ConversationController;
