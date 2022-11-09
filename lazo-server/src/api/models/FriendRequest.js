const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotFoundError = require('../exception/NotFoundError');

const friendRequestSchema = new Schema(
    {
        senderId: ObjectId,
        receiverId: ObjectId,
    },
    { timestamps: true },
);

friendRequestSchema.statics.existsByIds = async (senderId, receiverId) => {
    const isExists = await FriendRequest.findOne({
        senderId,
        receiverId,
    });

    if (isExists) {
        return true;
    }

    return false;
};

const FriendRequest = mongoose.model('friendRequest', friendRequestSchema);

module.exports = FriendRequest;
