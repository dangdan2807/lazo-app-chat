const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserContractSchema = new Schema(
    {
        _id: {
            userId: { type: Number, required: true, ref: 'user' },
            contractId: { type: Number, required: true, ref: 'user' },
        },
        delete_at: { type: Date },
        deleted: { type: Boolean, default: false },
    },
    {
        _id: false,
        timestamps: true,
    },
);

module.exports = mongoose.model('user_contract', UserContractSchema);
