const router = require('express').Router();
const stickerManagerController = require('../controllers/StickerManagerController');

router.post('', stickerManagerController.createStickerGroup);

module.exports = router;
