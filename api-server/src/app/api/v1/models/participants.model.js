const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const ParticipantsSchema = new Schema(
    {
        _id: { type: Number },
        conversationId: { type: Number, required: true, ref: 'conversation' },
        userId: { type: Number, required: true, ref: 'user' },
        delete_at: { type: Date },
        deleted: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

ParticipantsSchema.plugin(AutoIncrement, {
    id: 'participantId',
    inc_field: '_id',
});

module.exports = mongoose.model('participants', ParticipantsSchema);
