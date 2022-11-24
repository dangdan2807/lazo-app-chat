const Color = require('../models/Color');
const Classify = require('../models/Classify');

const MyError = require('../exception/MyError');

class ClassifyValidate {
    validate = async (userId, classify) => {
        const { _id, name, colorId } = classify;

        // check color phai ton tai
        await Color.checkById(colorId);

        // check name
        if (!name || name.length < 1 || name.length > 50) {
            throw new MyError('Name not valid');
        }

        let existsName;
        // update
        if (_id)
            existsName = await Classify.findOne({
                _id: { $ne: _id },
                name,
                userId,
            });
        else existsName = await Classify.findOne({ name, userId });

        if (existsName) {
            throw new MyError('Name exits');
        }
    };
}

module.exports = new ClassifyValidate();