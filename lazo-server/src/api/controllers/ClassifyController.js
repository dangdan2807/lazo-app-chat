const classifyService = require('../services/ClassifyService');

class ClassifyController {
    // [GET] /classifies/colors
    getListColors = async (req, res, next) => {
        try {
            const colors = await classifyService.getAllColors();
            res.status(200).json(colors);
        } catch (err) {
            next(err);
        }
    };

    // [GET] /classifies
    getList = async (req, res, next) => {
        const { _id } = req;

        try {
            const classifies = await classifyService.getList(_id);
            res.status(200).json(classifies);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /classifies
    add = async (req, res, next) => {
        const { _id } = req;

        try {
            const newClassify = await classifyService.add(_id, req.body);

            res.status(201).json(newClassify);
        } catch (err) {
            next(err);
        }
    };

    // [PUT] /classifies/:id
    update = async (req, res, next) => {
        const { _id } = req;

        const { id } = req.params;
        const classify = req.body;
        classify._id = id;

        try {
            await classifyService.update(_id, classify);

            res.status(200).json({
                status: 200,
                message: 'Classify updated successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [PUT] /classifies/:id
    delete = async (req, res, next) => {
        const { _id } = req;
        const { id } = req.params;

        try {
            await classifyService.delete(_id, id);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [POST] /classifies/:id/conversations/:conversationId
    addConversation = async (req, res, next) => {
        const { _id } = req;
        const { id, conversationId } = req.params;

        try {
            await classifyService.addConversation(_id, id, conversationId);

            res.status(201).json({
                status: 201,
                message: 'Conversation added successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /classifies/:id/conversations/:id
    deleteConversation = async (req, res, next) => {
        const { _id } = req;
        const { id, conversationId } = req.params;

        try {
            await classifyService.deleteConversation(_id, id, conversationId);

            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new ClassifyController();
