const Conversation = require('../models/Conversation');
const User = require('../models/User');

const MyError = require('../exception/MyError');

const memberValidate = {
    validateLeaveGroup: async (conversationId, userId) => {
        // check  có trong nhóm không
        const conversation = await Conversation.getByIdAndUserId(conversationId, userId);
        const { type, leaderId } = conversation;
        // cá nhân hoặc đang là leader không thể out nhóm
        if (!type || leaderId == userId) {
            throw new MyError("Cant't leave group");
        }
    },

    validateAddMember: async (conversationId, userId, newUserIds) => {
        if (newUserIds.length <= 0) {
            throw new MyError('User must > 0');
        }

        const conversation = await Conversation.getByIdAndUserId(conversationId, userId);

        const { type } = conversation;
        // cá nhân không thể thêm thành viên
        if (!type) {
            throw new MyError("Cant't add member, only group");
        }

        // check users đc add có tồn tại
        await User.checkByIds(newUserIds);
        // check xem có tồn tại trong nhóm chưa
        const isExistsNewUsers = await Conversation.findOne({
            _id: conversationId,
            members: { $in: newUserIds },
        });
        if (isExistsNewUsers) {
            throw new MyError('User exists in group');
        }
    },
};

module.exports = memberValidate;
