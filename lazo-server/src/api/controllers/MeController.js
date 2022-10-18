const meService = require('../services/MeService');
const redisDb = require('../../helpers/redis');

class MeController {
    constructor(io) {
        this.io = io;
    }

    // [GET] /profile
    profile = async (req, res, next) => {
        const { _id } = req;

        try {
            const isExistsCached = await redisDb.exists(_id);
            if (!isExistsCached) {
                await redisDb.set(_id, await meService.getProfile(_id));
            }

            res.json(await redisDb.get(_id));
        } catch (err) {
            next(err);
        }
    };


    // [PUT] /profile
    updateProfile = async (req, res, next) => {
        const { _id } = req;

        try {
            await meService.updateProfile(_id, req.body);
            await redisDb.set(_id, await meService.getProfile(_id));
            res.status(201).json({
                success: true,
                message: 'Profile updated successfully'
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MeController;
