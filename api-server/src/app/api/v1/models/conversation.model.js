const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
    {
        _id: { type: Number },
        title: { type: String, required: true },
        type: { type: String, required: true, enum: ['single', 'group'] },
        creatorId: { type: Number, required: true, ref: 'user' },
        deleteAt: { type: Date },
        deleted: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

ConversationSchema.plugin(AutoIncrement, {
    id: 'conversationId',
    inc_field: '_id',
});

module.exports = mongoose.model('Conversation', ConversationSchema);
