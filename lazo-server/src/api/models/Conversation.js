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
    { timestamps: true }
);

conversationSchema.index({ name: 'text' });

const Conversation = mongoose.model('conversation', conversationSchema);

module.exports = Conversation;