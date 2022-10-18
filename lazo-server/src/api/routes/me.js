const router = require('express').Router();
const MeController = require('../controllers/MeController');

const meRouter = (io) => {
    const meController = new MeController(io);

    router.get('/profile', meController.profile);

    return router;
};

module.exports = meRouter;
