const stickerService = require('../services/StickerService');
const redisDb = require('../../helpers/redis');

class StickerManagerController {
    // [POST] /admin/stickers-manager
    createStickerGroup = async (req, res, next) => {
        try {
            const stickerGroup = await stickerService.createStickerGroup(
                req.body,
            );

            await redisDb.set('stickers', await stickerService.getAll());
            res.status(201).json(stickerGroup);
        } catch (err) {
            next(err);
        }
    };

    // [PUT] /admin/stickers-manager/:id
    updateStickerGroup = async (req, res, next) => {
        const { id } = req.params;

        try {
            await stickerService.updateStickerGroup(id, req.body);
            await redisDb.set('stickers', await stickerService.getAll());
            
            res.status(200).json({
                status: 200,
                message: 'Sticker group updated successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /admin/stickers-manager/:id
    deleteStickerGroup = async (req, res, next) => {
        const { id } = req.params;

        try {
            await stickerService.deleteStickerGroup(id);
            await redisDb.set('stickers', await stickerService.getAll());
            
            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };

    // [POST] /admin/stickers-manager/:id
    addSticker = async (req, res, next) => {
        const { file } = req;
        const { id } = req.params;

        try {
            const url = await stickerService.addSticker(id, file);
            await redisDb.set('stickers', await stickerService.getAll());
            
            res.status(201).json({ status: 201, url });
        } catch (err) {
            next(err);
        }
    };

    //[DELETE] /admin/stickers-manager/:id/sticker?url=
    deleteSticker = async (req, res, next) => {
        const { id } = req.params;
        const { url = '' } = req.query;

        try {
            await stickerService.deleteSticker(id, url);
            await redisDb.set('stickers', await stickerService.getAll());
            
            res.status(204).json();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = new StickerManagerController();
