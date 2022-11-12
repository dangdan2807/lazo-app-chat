const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotFoundError = require('../exception/NotFoundError');

const channelSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        conversationId: {
            type: ObjectId,
            required: true,
        },
    },
    { timestamps: true },
);

channelSchema.statics.getByIdAndConversationId = async (
    _id,
    conversationId,
    message = 'Channel',
) => {
    const channel = await Channel.findOne({ _id, conversationId });
    if (!channel) {
        throw new NotFoundError(message);
    }

    return channel;
};

const Channel = mongoose.model('channel', channelSchema);

module.exports = Channel;
