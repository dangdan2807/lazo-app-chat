const stickerService = require('../services/StickerService');
const redisDb = require('../../helpers/redis');

class StickerController {
    // [GET] /stickers
    getAll = async (req, res, next) => {
        try {
            let stickers = await redisDb.get('stickers');

            if (!stickers) {
                stickers = await stickerService.getAll();
                await redisDb.set('stickers', stickers);
            }

            res.status(200).json(stickers);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new StickerController();
