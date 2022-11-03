const stickerService = require('../services/StickerService');
const redisDb = require('../../helpers/redis');

class StickerManagerController {
    // [POST] /admin/stickers-manager
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

    // [PATCH] /admin/stickers-manager/:id
    updateStickerGroup = async (req, res, next) => {
        const { id } = req.params;

        try {
            await stickerService.updateStickerGroup(id, req.body);
            await redisDb.set('stickers', await stickerService.getAll());
            res.status(200).json({
                success: true,
                message: 'Sticker group updated successfully',
            });
        } catch (err) {
            next(err);
        }
    }

    // [DELETE] /:id
    deleteStickerGroup = async (req, res, next) => {
        const { id } = req.params;

        try {
            await stickerService.deleteStickerGroup(id);
            await redisDb.set('stickers', await stickerService.getAll());
            res.status(204).json({
                success: true,
                message: 'Sticker group deleted successfully',
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new StickerManagerController();