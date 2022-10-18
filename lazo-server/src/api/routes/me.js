const router = require('express').Router();
const MeController = require('../controllers/MeController');
const uploadFile = require('../middleware/uploadFile');

const meRouter = (io) => {
    const meController = new MeController(io);

    router.get('/profile', meController.profile);
    router.put('/profile', meController.updateProfile);
    router.patch(
        '/avatar',
        uploadFile.singleUploadMiddleware,
        meController.changeAvatar
    );
    router.patch(
        '/cover-image',
        uploadFile.singleUploadMiddleware,
        meController.changeCoverImage
    );
    router.patch('/avatar/base64', meController.changeAvatarWithBase64);


    return router;
};

module.exports = meRouter;
