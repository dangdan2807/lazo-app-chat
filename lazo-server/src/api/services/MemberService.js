const Member = require('../models/Member');

class MemberService {
    getList = async (conversationId, userId) => {
        await Member.getByConversationIdAndUserId(conversationId, userId);

        const users = await Member.getListInfosByConversationId(conversationId);
        return users;
    };
}

module.exports = new MemberService();
