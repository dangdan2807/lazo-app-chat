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
}

module.exports = new ClassifyController();
