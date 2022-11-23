const channelService = require('../services/ChannelService');

class ChannelController {
    constructor(io) {
        this.io = io;
        this.add = this.add.bind(this);
        this.update = this.update.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    // [GET] /channels/:conversationId
    getAllByConversationId = async (req, res, next) => {
        const { _id } = req;
        const { conversationId } = req.params;

        try {
            const channels = await channelService.getAllByConversationId(
                conversationId,
                _id,
            );

            res.status(200).json(channels);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /channels
    add = async (req, res, next) => {
        const { _id } = req;
        try {
            const { channel, message } = await channelService.add(
                req.body,
                _id,
            );
            const { conversationId } = channel;

            this.io.to(conversationId + '').emit('new-channel', channel);
            this.io
                .to(conversationId + '')
                .emit('new-message', conversationId, message);

            res.status(201).json({ channel, message });
        } catch (err) {
            next(err);
        }
    };

    // [PUT] /channels
    update = async (req, res, next) => {
        const { _id } = req;

        try {
            const { channel, message } = await channelService.update(
                req.body,
                _id,
            );
            
            const { conversationId } = channel;
            this.io.to(conversationId + '').emit('update-channel', channel);
            this.io
                .to(conversationId + '')
                .emit('new-message', conversationId, message);

            res.status(200).json({ channel, message });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /channels/:channelId
    deleteById = async (req, res, next) => {
        const { _id } = req;
        const { channelId } = req.params;
        try {
            const result = await channelService.deleteById(channelId, _id);
            const { conversationId, message } = result;

            this.io
                .to(conversationId + '')
                .emit('delete-channel', { conversationId, channelId });
            this.io
                .to(conversationId + '')
                .emit('new-message', conversationId, message);

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /channels/:channelId/last-view
    getLastViewOfMembersInChannel = async (req, res, next) => {
        const { _id } = req;
        const { channelId } = req.params;

        try {
            const lastViews =
                await channelService.getLastViewOfMembersInChannel(
                    channelId,
                    _id,
                );

            res.status(200).json(lastViews);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = ChannelController;
