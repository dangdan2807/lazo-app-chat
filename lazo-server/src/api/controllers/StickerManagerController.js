const stickerService = require('../services/StickerService');
const redisDb = require('../../helpers/redis');

class StickerManagerController {
    // [POST]
    createStickerGroup = async (req, res, next) => {
        try {
            const stickerGroup = await stickerService.createStickerGroup(
                req.body
            );

            await redisDb.set('stickers', await stickerService.getAll());
            res.status(201).json(stickerGroup);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new StickerManagerController();