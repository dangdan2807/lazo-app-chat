const Sticker = require('../models/Sticker');

const MyError = require('../exception/MyError');
const NotFoundError = require('../exception/NotFoundError');

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

    updateStickerGroup = async (_id, stickerGroupInfo) => {
        await this.validateStickerGroup(stickerGroupInfo);
        const { name, description } = stickerGroupInfo;
        const { nModified } = await Sticker.updateOne({ _id }, { name, description });

        if (nModified === 0) {
            throw new NotFoundError('Sticker group');
        }
    };

    validateStickerGroup = async (stickerGroupInfo) => {
        const { name, description = '' } = stickerGroupInfo;

        if (!name || name.length < 1 || name.length > 100 || description.length > 100) {
            throw new MyError('1 <= name <= 100, description <= 100');
        }
    };

    deleteStickerGroup = async (_id) => {
        const stickerGroup = await Sticker.getById(_id);

        const { stickers } = stickerGroup;
        if (stickers.length > 0) {
            throw new MyError('Delete sticker group fail ');
        }

        await Sticker.deleteOne({ _id });
    };
}

module.exports = new StickerService();
