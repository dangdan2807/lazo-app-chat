const router = require('express').Router();
const stickerManagerController = require('../controllers/StickerManagerController');

router.post('', stickerManagerController.createStickerGroup);
router.put('/:id', stickerManagerController.updateStickerGroup);
router.delete('/:id', stickerManagerController.deleteStickerGroup);

module.exports = router;
