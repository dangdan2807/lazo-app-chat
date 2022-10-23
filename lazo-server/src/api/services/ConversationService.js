const Member = require('../models/Member');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const messageService = require('../services/MessageService');
const userService = require('./UserService');

const conversationValidate = require('../validate/conversationValidate');

const dateUtils = require('../../utils/dateUtils');

class ConversationService {
    // danh sách
    getList = async (userId) => {
        const conversations = await Conversation.getListByUserId(userId);

        const conversationIds = conversations.map((conversationEle) => conversationEle._id);

        return await this.getListSummaryByIds(conversationIds, userId);
    };

    // type group
    getListGroup = async (name, userId) => {
        const conversations =
            await Conversation.getListGroupByNameContainAndUserId(name, userId);

        const conversationIds = conversations.map(
            (conversationEle) => conversationEle._id
        );

        return await this.getListSummaryByIds(conversationIds, userId);
    }

    // type individual
    getListIndividual = async (name, userId) => {
        const conversations =
            await Conversation.getListIndividualByNameContainAndUserId(
                name,
                userId
            );

        const conversationIds = conversations.map(
            (conversationEle) => conversationEle._id
        );

        return await this.getListSummaryByIds(conversationIds, userId);
    }

    getListSummaryByIds = async (ids, userId) => {
        const conversationsResult = [];
        for (const id of ids) {
            const conversation = await this.getSummaryByIdAndUserId(id, userId);
            conversationsResult.push(conversation);
        }

        return conversationsResult;
    };

    // get thông tin tóm tắt của 1 cuộc hộp thoại.
    getSummaryByIdAndUserId = async (_id, userId) => {
        // check xem có nhóm này hay không
        const member = await Member.getByConversationIdAndUserId(_id, userId);
        const { lastView, isNotify } = member;

        const conversation = await Conversation.findById(_id);
        const { lastMessageId, type, members, leaderId, isJoinFromLink, managerIds } = conversation;

        const lastMessage = lastMessageId
            ? await messageService.getById(lastMessageId, type)
            : null;
        const numberUnread = await Message.countUnread(lastView, _id);

        let nameAndAvatarInfo;
        if (type) {
            nameAndAvatarInfo = await this.getGroupConversation(conversation);
        } else {
            nameAndAvatarInfo = await this.getIndividualConversation(_id, userId);

            const { members } = conversation;
            const index = members.findIndex((ele) => ele + '' != userId);
            nameAndAvatarInfo.userId = members[index];
            nameAndAvatarInfo.friendStatus = await userService.getFriendStatus(
                userId,
                members[index],
            );
        }

        let lastMessageTempt = {};

        const numberOfDeletedMessages = await Message.countDocuments({
            conversationId: _id,
            deletedUserIds: { $nin: [userId] },
        });
        if (!lastMessage || numberOfDeletedMessages === 0) {
            lastMessageTempt = null;
        } else {
            lastMessageTempt = {
                ...lastMessage,
                createdAt: dateUtils.toTime(lastMessage.createdAt),
            };
        }

        return {
            _id,
            ...nameAndAvatarInfo,
            type,
            totalMembers: members.length,
            numberUnread,
            leaderId,
            managerIds,
            lastMessage: lastMessageTempt,
            isNotify,
            isJoinFromLink,
        };
    };

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

    getIndividualConversation = async (_id, userId) => {
        const datas = await Member.aggregate([
            {
                $match: {
                    conversationId: ObjectId(_id),
                    userId: { $ne: ObjectId(userId) },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    name: '$user.name',
                    avatar: '$user.avatar',
                    avatarColor: '$user.avatarColor',
                },
            },
        ]);

        return datas[0];
    };

    getGroupConversation = async (conversation) => {
        const { _id, name, avatar } = conversation;

        let groupName = '';
        let groupAvatar = [];
        if (!name || !avatar) {
            const nameAndAvataresOfGroup = await Conversation.getListNameAndAvatarOfMembersById(
                _id,
            );

            for (const tempt of nameAndAvataresOfGroup) {
                const nameTempt = tempt.name;
                const { avatar, avatarColor } = tempt;

                groupName += `, ${nameTempt}`;
                groupAvatar.push({ avatar, avatarColor });
            }
        }

        const result = {
            name,
            avatar,
        };

        if (!name) {
            result.name = groupName.slice(2);
        }
        if (!avatar) {
            result.avatar = groupAvatar;
        }

        return result;
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
