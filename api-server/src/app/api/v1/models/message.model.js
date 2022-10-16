const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
    {
        _id: { type: Number },
        senderId: { type: Number, required: true, ref: 'user' },
        conversationId: { type: Number, required: true, ref: 'conversation' },
        message: { type: String, required: true },
        messageType: {
            type: String,
            required: true,
            enum: ['text', 'image', 'video', 'audio', 'file'],
        },
        deleteAt: { type: Date },
        deleted: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

MessageSchema.plugin(AutoIncrement, {
    id: 'messageId',
    inc_field: '_id',
});

module.exports = mongoose.model('message', MessageSchema);
