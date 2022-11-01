const Sticker = require('../models/Sticker');

class StickerService {
    getAll = async () => {
        return await Sticker.find({});
    }
}

module.exports = new StickerService();
