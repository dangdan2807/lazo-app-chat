const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserContractSchema = new Schema(
    {
        _id: {
            userId: { type: Number, required: true, ref: 'user' },
            conversationId: { type: Number, required: true, ref: 'conversation' },
        },
        isBlocked: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

module.exports = mongoose.model('block_list', UserContractSchema);
