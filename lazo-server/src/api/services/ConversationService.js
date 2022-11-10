const Member = require('../models/Member');
const Conversation = require('../models/Conversation');

const messageService = require('../services/MessageService');

const conversationValidate = require('../validate/conversationValidate');

class ConversationService {
    createIndividualConversationWhenWasFriend = async (userId1, userId2) => {
        const { _id, isExists } = await this.createIndividualConversation(userId1, userId2);

        // tạo message
        const newMessage = {
            content: 'Đã là bạn bè',
            type: 'NOTIFY',
            conversationId: _id,
        };
        const saveMessage = await messageService.addText(newMessage, userId1);

        return { conversationId: _id, isExists, message: saveMessage };
    };

    // trả id conversation
    createIndividualConversation = async (userId1, userId2) => {
        const { userName1, userName2, conversationId } =
            await conversationValidate.validateIndividualConversation(userId1, userId2);

        if (conversationId) {
            return { _id: conversationId, isExists: true };
        }

        // thêm cuộc trò chuyện
        const newConversation = new Conversation({
            members: [userId1, userId2],
            type: false,
        });
        const saveConversation = await newConversation.save();
        const { _id } = saveConversation;

        // tạo 2 member
        const member1 = new Member({
            conversationId: _id,
            userId: userId1,
            name: userName1,
        });

        const member2 = new Member({
            conversationId: _id,
            userId: userId2,
            name: userName2,
        });

        // save
        member1.save().then();
        member2.save().then();

        return { _id, isExists: false };
    };
}

module.exports = new ConversationService();
