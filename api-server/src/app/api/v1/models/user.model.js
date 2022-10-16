const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        _id: { type: Number },
        firstName: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255,
            default: 'user',
        },
        lastName: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 255,
            default: '',
        },
        gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
        accountId: { type: Number, required: true, ref: 'account' },
        avatarUrl: { type: String, required: true, default: '' },
    },
    {
        _id: false,
        timestamps: true,
    },
);

UserSchema.plugin(AutoIncrement, {
    id: 'userId',
    inc_field: '_id',
});

module.exports = mongoose.model('user', UserSchema);
