const meService = require('../services/MeService');
const redisDb = require('../../helpers/redis');

class MeController {
    constructor(io) {
        this.io = io;
        this.revokeToken = this.revokeToken.bind(this);
    }

    // [GET] /me/profile
    profile = async (req, res, next) => {
        const { _id } = req;

        try {
            const isExistsCached = await redisDb.exists(_id);
            if (!isExistsCached) {
                await redisDb.set(_id, await meService.getProfile(_id));
            }

            res.status(200).json(await redisDb.get(_id));
        } catch (err) {
            next(err);
        }
    };

    // [PUT] /me/profile
    updateProfile = async (req, res, next) => {
        const { _id } = req;

        try {
            await meService.updateProfile(_id, req.body);
            const user = await meService.getProfile(_id);

            await redisDb.set(_id, user);
            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    };

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
    };

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
    };

    // [PATCH] /me/avatar/base64
    changeAvatarWithBase64 = async (req, res, next) => {
        const { _id } = req;

        try {
            const avatar = await meService.changeAvatarWithBase64(_id, req.body);

            const cachedUser = await redisDb.get(_id);
            await redisDb.set(_id, { ...cachedUser, avatar });

            return res.status(201).json({ avatar });
        } catch (err) {
            next(err);
        }
    };

    // [PATCH] /me/cover-image/base64
    changeCoverImageWithBase64 = async (req, res, next) => {
        const { _id } = req;

        try {
            const coverImage = await meService.changeCoverImageWithBase64(_id, req.body);

            const cachedUser = await redisDb.get(_id);
            await redisDb.set(_id, { ...cachedUser, coverImage });

            return res.status(201).json({ coverImage });
        } catch (err) {
            next(err);
        }
    };

    // [GET] /me/phone-books
    getPhoneBooks = async (req, res, next) => {
        const { _id } = req;

        try {
            const phoneBooks = await meService.getPhoneBooks(_id);

            res.status(201).json(phoneBooks);
        } catch (err) {
            next(err);
        }
    };

    // [POST] /me/phone-books
    syncPhoneBooks = async (req, res, next) => {
        const { _id } = req;
        const { phones } = req.body;

        try {
            await meService.syncPhoneBooks(_id, phones);

            res.status(201).json({
                status: 201,
                message: 'Phone books synced successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [PATCH] /me/password
    changePassword = async (req, res, next) => {
        const { _id } = req;
        const { oldPassword, newPassword } = req.body;

        try {
            await meService.changePassword(_id, oldPassword, newPassword);

            res.status(200).json({
                status: 200,
                message: 'Password changed successfully',
            });
        } catch (err) {
            next(err);
        }
    };

    // [DELETE] /me/revoke-token
    revokeToken = async (req, res, next) => {
        const { _id } = req;
        const { password, key } = req.body;
        const source = req.headers['user-agent'];

        try {
            const tokenAndRefreshToken = await meService.revokeToken(_id, password, source);

            this.io.to(_id + '').emit('revoke-token', { key });

            res.status(200).json(tokenAndRefreshToken);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = MeController;
