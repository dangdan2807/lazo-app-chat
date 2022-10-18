const router = require('express').Router();
const MeController = require('../controllers/MeController');

const meRouter = (io) => {
    const meController = new MeController(io);

    router.get('/profile', meController.profile);
    router.put('/profile', meController.updateProfile);

    return router;
};

module.exports = meRouter;
