const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const friendSchema = new Schema({
    userIds: [ObjectId],
});

friendSchema.statics.existsByIds = async (userId1, userId2) => {
    const isExists = await Friend.findOne({
        userIds: { $all: [userId1, userId2] },
    });

    if (isExists) {
        return true;
    }

    return false;
};

const Friend = mongoose.model('friend', friendSchema);

module.exports = Friend;
