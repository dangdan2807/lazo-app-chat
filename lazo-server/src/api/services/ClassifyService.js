const ObjectId = require('mongoose').Types.ObjectId;

const Classify = require('../models/Classify');
const Color = require('../models/Color');
const Member = require('../models/Member');

const NotFoundError = require('../exception/NotFoundError');
const MyError = require('../exception/MyError');

const classifyValidate = require('../validate/classifyValidate');

const commonUtils = require('../../utils/commonUtils');

class ClassifyService {
    getAllColors = async () => {
        return await Color.find({});
    };

    getRandomColor = async () => {
        const colors = await Color.find({});
        const index = commonUtils.getRandomInt(0, colors.length - 1);

        return colors[index].code;
    };

    getList = async (userId) => {
        return await Classify.aggregate([
            { $match: { userId: ObjectId(userId) } },
            {
                $lookup: {
                    from: 'colors',
                    localField: 'colorId',
                    foreignField: '_id',
                    as: 'color',
                },
            },
            { $unwind: '$color' },
            { $project: { _id: 1, name: 1, color: 1, conversationIds: 1 } },
        ]);
    };

    add = async (userId, classify) => {
        await classifyValidate.validate(userId, classify);
        const { name, colorId } = classify;

        const newClassify = new Classify({
            name,
            colorId,
            userId,
        });

        const { _id } = await newClassify.save();

        return {
            _id,
            name,
            colorId,
        };
    };

    update = async (userId, classify) => {
        await classifyValidate.validate(userId, classify);
        const { _id, name, colorId } = classify;

        const queryResult = await Classify.updateOne({ _id, userId }, { name, colorId });

        const { nModified } = queryResult;

        if (nModified === 0) {
            throw new NotFoundError('Classify');
        }
    };

    delete = async (userId, classifyId) => {
        const queryResult = await Classify.deleteOne({
            _id: classifyId,
            userId,
        });
        const { deletedCount } = queryResult;

        if (deletedCount === 0) {
            throw new NotFoundError('Classify');
        }
    };

    addConversation = async (userId, classifyId, conversationId) => {
        await Member.getByConversationIdAndUserId(conversationId, userId);

        if (
            await Classify.findOne({
                _id: classifyId,
                conversationIds: { $in: [conversationId] },
            })
        ) {
            throw new MyError('Conversation exists');
        }

        const queryResult = await Classify.updateOne(
            { _id: classifyId, userId },
            {
                $push: {
                    conversationIds: conversationId,
                },
            },
        );

        const { nModified } = queryResult;

        if (nModified === 0) {
            throw new NotFoundError('Add Conversation Fail');
        }

        await Classify.updateMany(
            {
                _id: { $ne: classifyId },
                conversationIds: { $in: [conversationId] },
            },
            { $pull: { conversationIds: conversationId } },
        );
    };

    deleteConversation = async (userId, classifyId, conversationId) => {
        await Member.getByConversationIdAndUserId(conversationId, userId);
        const queryResult = await Classify.updateOne(
            { _id: classifyId, userId },
            {
                $pull: {
                    conversationIds: conversationId,
                },
            },
        );

        const { nModified } = queryResult;

        if (nModified === 0) {
            throw new NotFoundError('Delete Conversation Fail');
        }
    };
}

module.exports = new ClassifyService();
