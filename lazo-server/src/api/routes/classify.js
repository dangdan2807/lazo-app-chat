const router = require('express').Router();
const classifyController = require('../controllers/ClassifyController');

router.get('/colors', classifyController.getListColors);
router.get('', classifyController.getList);
router.post('', classifyController.add);
router.put('/:id', classifyController.update);

module.exports = router;
