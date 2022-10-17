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
    }
}

module.exports = new ClassifyController();
