const channelService = require('../services/ChannelService');

class ChannelController {
    constructor(io) {
        this.io = io;
        this.add = this.add.bind(this);
    }
    
    // [GET] /channels/:conversationId
    getAllByConversationId = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;

        try {
            const channels = await channelService.getAllByConversationId(
                conversationId,
                _id
            );

            res.status(200).json(channels);
        } catch (err) {
            next(err);
        }
    }

}

module.exports = ChannelController;
