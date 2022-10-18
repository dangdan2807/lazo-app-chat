const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotFoundError = require('../exception/NotFoundError');

const memberSchema = new Schema({
    conversationId: ObjectId,
    userId: ObjectId,
    lastView: {
        type: Date,
        default: new Date(),
    },
    name: String,
    lastViewOfChannels: [{ channelId: ObjectId, lastView: Date }],
    isNotify: {
        type: Boolean,
        default: true,
    },
});

memberSchema.statics.getByConversationIdAndUserId = async (
    conversationId,
    userId,
    message = 'Conversation',
) => {
    const member = await Member.findOne({
        conversationId,
        userId,
    });

    if (!member) {
        throw new NotFoundError(message);
    }

    return member;
};

const Member = mongoose.model('member', memberSchema);

module.exports = Member;
