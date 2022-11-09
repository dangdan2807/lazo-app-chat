const bcrypt = require('bcryptjs');
const MyError = require('../exception/MyError');
const NotFoundError = require('../exception/NotFoundError');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dateUtils = require('../../utils/dateUtils');

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '',
        },
        avatarColor: {
            type: String,
            default: 'white',
        },
        coverImage: String,
        type: Boolean,
        dateOfBirth: {
            type: Date,
            default: new Date('2000-01-01'),
        },
        gender: {
            type: Boolean,
            default: false,
        },
        refreshTokens: {
            type: [
                {
                    token: String,
                    source: String,
                },
            ],
            default: [],
        },
        phoneBooks: {
            type: [{ name: String, phone: String }],
            default: [],
        },
        otp: String,
        otpTime: Date,
        isActived: Boolean,
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        timeRevokeToken: {
            type: Date,
            default: new Date(),
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({
        username,
        isActived: true,
        isDeleted: false,
    });

    if (!user) throw new NotFoundError('User');

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new MyError('Password invalid');

    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
