const meService = require('../services/MeService');
const redisDb = require('../../helpers/redis');

class MeController {
    constructor(io) {
        this.io = io;
    }

    // [GET] /me/profile
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


    // [PUT] /me/profile
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

    // [PATCH] /me/avatar
    changeAvatar = async (req, res, next) => {
        const { _id, file } = req;

        try {
            const avatar = await meService.changeAvatar(_id, file);

            const cachedUser = await redisDb.get(_id);
            await redisDb.set(_id, { ...cachedUser, avatar });

            return res.status(201).json({ avatar });
        } catch (err) {
            next(err);
        }
    }

    // [PATCH] /me/cover-image
    changeCoverImage = async (req, res, next) => {
        const { _id, file } = req;

        try {
            const coverImage = await meService.changeCoverImage(_id, file);

            const cachedUser = await redisDb.get(_id);
            await redisDb.set(_id, { ...cachedUser, coverImage });

            return res.status(201).json({ coverImage });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = MeController;
