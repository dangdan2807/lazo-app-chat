const Member = require('../models/Member');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const memberValidate = require('../validate/memberValidate');
const messageService = require('../services/MessageService');

const MEMBER_ADD_MESSAGE = 'Đã thêm vào nhóm';

class MemberService {
    getList = async (conversationId, userId) => {
        await Member.getByConversationIdAndUserId(conversationId, userId);

        const users = await Member.getListInfosByConversationId(conversationId);
        return users;
    };

    // thêm thành viên
    addMembers = async (conversationId, userId, newUserIds) => {
        await memberValidate.validateAddMember(
            conversationId,
            userId,
            newUserIds
        );

        // add member trong conversation
        await Conversation.updateOne(
            { _id: conversationId },
            { $push: { members: newUserIds } }
        );

        newUserIds.forEach((userIdEle) => {
            const member = new Member({
                conversationId,
                userId: userIdEle,
            });
            member.save().then();
        });

        // tin nhắn thêm vào group
        const newMessage = new Message({
            userId,
            manipulatedUserIds: newUserIds,
            content: MEMBER_ADD_MESSAGE,
            type: 'NOTIFY',
            conversationId,
        });

        const { _id, createdAt } = await newMessage.save();

        Conversation.updateOne(
            { _id: conversationId },
            { lastMessageId: _id }
        ).then();

        Member.updateOne(
            { conversationId, userId },
            { lastView: createdAt }
        ).then();

        return await messageService.getById(_id, true);
    }
}

module.exports = new MemberService();
