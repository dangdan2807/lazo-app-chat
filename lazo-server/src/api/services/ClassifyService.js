const Classify = require('../models/Classify');
const Color = require('../models/Color');

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
}

module.exports = new ClassifyService();
