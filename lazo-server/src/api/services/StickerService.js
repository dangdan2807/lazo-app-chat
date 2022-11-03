const Sticker = require('../models/Sticker');

const MyError = require('../exception/MyError');

class StickerService {
    getAll = async () => {
        return await Sticker.find({});
    };

    createStickerGroup = async (stickerGroupInfo) => {
        await this.validateStickerGroup(stickerGroupInfo);

        const { name, description } = stickerGroupInfo;
        const newStickerGroup = new Sticker({ name, description });
        return await newStickerGroup.save();
    };

    validateStickerGroup = async (stickerGroupInfo) => {
        const { name, description = '' } = stickerGroupInfo;

        if (!name || name.length < 1 || name.length > 100 || description.length > 100) {
            throw new MyError('1 <= name <= 100, description <= 100');
        }
    };
}

module.exports = new StickerService();
