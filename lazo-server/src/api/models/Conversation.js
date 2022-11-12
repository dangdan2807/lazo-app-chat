const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotFoundError = require('../exception/NotFoundError');

const conversationSchema = new Schema(
    {
        name: String,
        avatar: String,
        leaderId: ObjectId,
        managerIds: {
            type: [ObjectId],
            default: [],
        },
        lastMessageId: ObjectId,
        pinMessageIds: {
            type: [ObjectId],
            default: [],
        },
        members: [ObjectId],
        isJoinFromLink: {
            type: Boolean,
            default: true,
        },
        type: Boolean,
    },
    { timestamps: true },
);

conversationSchema.index({ name: 'text' });

conversationSchema.statics.existsIndividualConversation = async (userId1, userId2) => {
    const conversation = await Conversation.findOne({
        type: false,
        members: { $all: [userId1, userId2] },
    });

    if (conversation) {
        return conversation._id;
    }
    return null;
};

conversationSchema.statics.existsByUserIds = async (_id, userIds, message = 'Conversation') => {
    const conversation = await Conversation.findOne({
        _id,
        members: { $all: [...userIds] },
    });

    if (!conversation) {
        throw new NotFoundError(message);
    }

    return conversation;
};

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;
