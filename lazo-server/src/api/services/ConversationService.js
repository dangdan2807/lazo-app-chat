const Member = require('../models/Member');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Classify = require('../models/Classify');
const User = require('../models/User');

const messageService = require('../services/MessageService');
const userService = require('./UserService');
const awsS3Service = require('./AwsS3Service');

const conversationValidate = require('../validate/conversationValidate');
const messageValidate = require('../validate/messageValidate');

const MyError = require('../exception/MyError');
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
        const conversations = await Conversation.getListGroupByNameContainAndUserId(name, userId);

        const conversationIds = conversations.map((conversationEle) => conversationEle._id);

        return await this.getListSummaryByIds(conversationIds, userId);
    };

    // type individual
    getListIndividual = async (name, userId) => {
        const conversations = await Conversation.getListIndividualByNameContainAndUserId(
            name,
            userId,
        );

        const conversationIds = conversations.map((conversationEle) => conversationEle._id);

        return await this.getListSummaryByIds(conversationIds, userId);
    };

    getListSummaryByIds = async (ids, userId) => {
        const conversationsResult = [];
        for (const id of ids) {
            const conversation = await this.getSummaryByIdAndUserId(id, userId);
            conversationsResult.push(conversation);
        }

        return conversationsResult;
    };

    getListFollowClassify = async (classifyId, userId) => {
        // check user này có phân loại này không
        const classify = await Classify.getByIdAndUserId(classifyId, userId);
        const { conversationIds } = classify;

        return await this.getListSummaryByIds(conversationIds, userId);
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
    createGroupConversation = async (userIdSelf, name, userIds) => {
        if (userIds.length <= 0) {
            throw new MyError('userIds invalid');
        }

        // kiểm tra user
        const userIdsTempt = [userIdSelf, ...userIds];
        await User.checkByIds(userIdsTempt);

        // thêm cuộc trò chuyện
        const newConversation = new Conversation({
            name,
            leaderId: userIdSelf,
            members: [userIdSelf, ...userIds],
            type: true,
        });
        const saveConversation = await newConversation.save();
        const { _id } = saveConversation;

        // tạo tin nhắn
        const newMessage = new Message({
            userId: userIdSelf,
            content: 'Đã tạo nhóm',
            type: 'NOTIFY',
            conversationId: _id,
        });

        await newMessage.save();

        // lưu danh sách user
        for (const userId of userIdsTempt) {
            const member = new Member({
                conversationId: _id,
                userId,
                lastViewOfChannels: [],
            });

            member.save().then();
        }

        const memberAddMessage = new Message({
            userId: userIdSelf,
            manipulatedUserIds: [...userIds],
            content: 'Đã thêm vào nhóm',
            type: 'NOTIFY',
            conversationId: _id,
        });

        memberAddMessage.save().then((message) => {
            Conversation.updateOne({ _id }, { lastMessageId: message._id }).then();
        });

        return _id;
    };

    rename = async (_id, name, userId) => {
        const conversation = await Conversation.getByIdAndUserId(_id, userId);
        const { type } = conversation;

        // group
        if (type) {
            // thêm tin nhắn đổi tên
            const newMessage = new Message({
                userId,
                content: `Đã đổi tên nhóm thành <b>"${name}"</b> `,
                type: 'NOTIFY',
                conversationId: _id,
            });
            const saveMessage = await newMessage.save();
            // cập nhật tin nhắn mới nhất
            await Conversation.updateOne({ _id }, { name, lastMessageId: saveMessage._id });
            // cập nhật lastView thằng đổi
            await Member.updateOne(
                { conversationId: _id, userId },
                { lastView: saveMessage.createdAt },
            );

            return await messageService.getById(saveMessage._id, true);
        }

        // cá nhân
        const { members } = conversation;
        const otherUserId = members.filter((userIdEle) => userIdEle != userId);

        await Member.updateOne({ conversationId: _id, userId: otherUserId[0] }, { name });

        return;
    };

    // trả về link avatar
    updateAvatar = async (_id, file, userId) => {
        const { mimetype } = file;
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            throw new MyError('Image invalid');
        }

        const conversation = await Conversation.getByIdAndUserId(_id, userId);
        const { type } = conversation;

        // chỉ thay đổi ảnh nhóm
        if (!type) {
            throw new MyError('Upload file fail, only for group');
        }

        const { avatar } = conversation;
        if (avatar) {
            await awsS3Service.deleteFile(avatar);
        }

        const avatarUrl = await awsS3Service.uploadFile(file);

        // thêm tin nhắn đổi tên
        const newMessage = new Message({
            userId,
            content: `Ảnh đại diện nhóm đã thay đổi`,
            type: 'NOTIFY',
            conversationId: _id,
        });
        const saveMessage = await newMessage.save();
        // cập nhật conversation
        await Conversation.updateOne(
            { _id },
            { avatar: avatarUrl, lastMessageId: saveMessage._id },
        );
        // cập nhật lastView thằng đổi
        await Member.updateOne(
            { conversationId: _id, userId },
            { lastView: saveMessage.createdAt },
        );

        return {
            avatar: avatarUrl,
            lastMessage: await messageService.getById(saveMessage._id, true),
        };
    };

    // trả về link avatar
    updateAvatarWithBase64 = async (_id, fileInfo, userId) => {
        messageValidate.validateImageWithBase64(fileInfo);

        const conversation = await Conversation.getByIdAndUserId(_id, userId);
        const { type } = conversation;

        // chỉ thay đổi ảnh nhóm
        if (!type) {
            throw new MyError('Upload file fail, only for group');
        }

        const { avatar } = conversation;
        if (avatar) await awsS3Service.deleteFile(avatar);

        const { fileName, fileExtension, fileBase64 } = fileInfo;
        const avatarUrl = await awsS3Service.uploadWithBase64(fileBase64, fileName, fileExtension);

        // thêm tin nhắn đổi tên
        const newMessage = new Message({
            userId,
            content: `Ảnh đại diện nhóm đã thay đổi`,
            type: 'NOTIFY',
            conversationId: _id,
        });
        const saveMessage = await newMessage.save();
        // cập nhật conversation
        await Conversation.updateOne(
            { _id },
            { avatar: avatarUrl, lastMessageId: saveMessage._id },
        );
        // cập nhật lastView thằng đổi
        await Member.updateOne(
            { conversationId: _id, userId },
            { lastView: saveMessage.createdAt },
        );

        return {
            avatar: avatarUrl,
            lastMessage: await messageService.getById(saveMessage._id, true),
        };
    };
}

module.exports = new ConversationService();
