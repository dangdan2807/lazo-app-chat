const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const AccountSchema = new Schema(
    {
        _id: { type: Number },
        phone: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 20,
            unique: true
        },
        email: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 100,
            unique: true
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 1000,
        },
        status: {
            type: Boolean,
            required: true,
            default: true,
        },
        roleId: {
            type: Number,
            required: true,
            ref: 'role',
            default: 2, // 1: admin, 2: user
        },
        is_active: { type: Boolean, default: true },
    },
    {
        _id: false,
        timestamps: true,
    },
);

AccountSchema.plugin(AutoIncrement, {
    id: 'accountId',
    inc_field: '_id',
});

module.exports = mongoose.model('account', AccountSchema);
